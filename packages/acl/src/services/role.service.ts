import {MarkRequired} from 'ts-essentials';
import {Options, repository, Where} from '@loopback/repository';
import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import debugFactory from 'debug';
import {FilterExcludingWhere} from '@loopback/filter';
import {AclBaseService} from './base-service';
import {DeleteResult, EntityLike, FilterWithCustomWhere, OptionsWithDomain, ResourceRepresent} from '../types';
import {AclBindings} from '../keys';
import {AclRole, AclRoleActor, AclRoleAttrs, AclRolePermission} from '../models';
import {generateRoleId, isResourceRepresent, parseRoleId, resolveRoleId} from '../helpers';
import {PolicyManager} from '../policy.manager';
import {AclRoleActorRepository, AclRolePermissionRepository, AclRoleRepository} from '../repositories';

const debug = debugFactory('bleco:acl:role-service');

@injectable({scope: BindingScope.SINGLETON})
export class AclRoleService extends AclBaseService<AclRole, AclRoleAttrs> {
  repo: AclRoleRepository;

  constructor(
    @repository(AclRoleRepository)
    repo: AclRoleRepository,
    @inject(AclBindings.POLICY_MANAGER)
    policyManager: PolicyManager,
    @repository(AclRoleActorRepository)
    public roleActorRepository: AclRoleActorRepository,
    @repository(AclRolePermissionRepository)
    public rolePermissionRepository: AclRolePermissionRepository,
  ) {
    super(repo, policyManager);
  }

  async find(filter?: FilterWithCustomWhere<AclRole, AclRoleAttrs>, options?: OptionsWithDomain): Promise<AclRole[]> {
    return this.repo.find(filter ? await this.resolveFilter(filter, options) : undefined);
  }

  async findOne(
    filter: FilterWithCustomWhere<AclRole, AclRoleAttrs>,
    options?: OptionsWithDomain,
  ): Promise<AclRole | null> {
    options = {...options};
    return this.repo.findOne(await this.resolveFilter(filter, options));
  }

  async findById(id: string, filter?: FilterExcludingWhere<AclRole>, options?: Options): Promise<AclRole> {
    return this.repo.findById(id, filter, options);
  }

  async create(attrs: MarkRequired<AclRoleAttrs, 'name' | 'resource'>, options?: OptionsWithDomain): Promise<AclRole> {
    options = {...options};
    const {permissions, ...unwrappedAttrs} = attrs;
    const {name, resource} = unwrappedAttrs;
    const props = await this.repo.resolveAttrs(unwrappedAttrs, options);

    const tx = await this.tf.beginTransaction(options);
    try {
      await (async () => {
        const type = await this.repo.hasRole(name, resource);
        if (type === 'builtin') {
          throw new Error(`Builtin role "${generateRoleId(name, resource)}" cannot be added.`);
        } else if (type === 'custom') {
          throw new Error(`Role "${generateRoleId(name, resource)}" already exists.`);
        }
      })();

      const answer = await this.repo.create(props, options);
      if (permissions?.length) {
        await this.updatePermissions(answer.id, permissions, options);
      }
      await tx.commit();
      return answer;
    } catch (e) {
      await tx?.rollback();
      throw e;
    }
  }

  async delete(
    role: string | EntityLike,
    resourceOrOptions?: ResourceRepresent | OptionsWithDomain,
    options?: OptionsWithDomain,
  ): Promise<DeleteResult<{Role: number; RolePermission: number; RoleActor: number}> | undefined> {
    let resource: ResourceRepresent | undefined;
    if (resourceOrOptions && isResourceRepresent(resourceOrOptions)) {
      resource = resourceOrOptions;
    } else {
      options = resourceOrOptions;
    }
    const id = resolveRoleId(role, resource);
    options = {...options};

    const type = await this.repo.hasRole(id);
    if (!type) {
      return {count: 0};
    }
    if (type === 'builtin') {
      throw new Error(`Builtin role "${parseRoleId(id).name}" cannot be removed.`);
    }
    const roles = (await this.repo.resolveAttrs({id}, options)) as Where<AclRole>;
    const roleActors = (await this.roleActorRepository.resolveAttrs({roleId: id}, options)) as Where<AclRoleActor>;
    const rolePermissions = {roleId: id} as Where<AclRolePermission>;
    return this.deleteCascade({roles, rolePermissions, roleActors}, options);
  }

  async deleteForResource(
    resource: ResourceRepresent,
    options?: OptionsWithDomain,
  ): Promise<DeleteResult<{Role: number; RolePermission: number; RoleActor: number}>> {
    options = {...options};
    const roleWhere = (await this.repo.resolveAttrs({resource}, options)) as Where<AclRole>;
    const roleActorWhere = (await this.roleActorRepository.resolveAttrs({resource}, options)) as Where<AclRoleActor>;
    const rolePermissions: Where<AclRolePermission> = {roleId: {like: generateRoleId('*', resource)}};
    return this.deleteCascade({roles: roleWhere, rolePermissions, roleActors: roleActorWhere}, options);
  }

  async updatePermissions(roleId: string, permissions: string[], options?: OptionsWithDomain) {
    options = {...options};
    const domainId = await this.repo.resolveDomainId(options);
    const tx = await this.tf.beginTransaction(options);
    try {
      await this.rolePermissionRepository.deleteAll({roleId}, options);
      if (permissions.length) {
        await this.rolePermissionRepository.createAll(
          permissions.map(permission => ({roleId, permission, domainId})),
          options,
        );
      }
      await tx.commit();
    } catch (e) {
      await tx?.rollback();
      throw e;
    }
  }

  protected async deleteCascade(
    where: {roles: Where<AclRole>; rolePermissions: Where<AclRolePermission>; roleActors: Where<AclRoleActor>},
    options: OptionsWithDomain,
  ) {
    let roleCount = 0;
    let rolePermissionCount = 0;
    let roleActorCount = 0;
    const tx = await this.tf.beginTransaction(options);
    try {
      debug('Deleting role actors %o', where.roleActors);
      ({count: roleActorCount} = await this.roleActorRepository.deleteAll(where.roleActors, options));
      debug('Deleted %d role actors', roleActorCount);

      debug('Deleting role permissions %o', where.rolePermissions);
      ({count: rolePermissionCount} = await this.rolePermissionRepository.deleteAll(where.rolePermissions, options));
      debug('Deleted %d role permissions', roleCount);

      debug('Deleting roles %o', where.roles);
      ({count: roleCount} = await this.repo.deleteAll(where.roles, options));
      debug('Deleted %d roles', roleCount);
      await tx.commit();
      return {
        count: roleCount,
        details: {Role: roleCount, RolePermission: rolePermissionCount, RoleActor: roleActorCount},
      };
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
}
