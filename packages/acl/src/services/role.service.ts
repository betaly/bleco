import {AclBaseService} from './base-service';
import {
  DeleteResult,
  DomainizedCondition,
  EntityLike,
  FilterWithCustomWhere,
  OptionsWithDomain,
  ResourceRepresent,
} from '../types';
import {AclRole, AclRoleActor, AclRoleAttrs} from '../models';
import {Options, repository} from '@loopback/repository';
import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import {generateRoleId, isResourceRepresent, parseRoleId, resolveRoleId} from '../helpers';
import {FilterExcludingWhere} from '@loopback/filter';
import {AclBindings} from '../keys';
import {PolicyManager} from '../policy.manager';
import {AclRoleActorRepository, AclRoleRepository} from '../repositories';
import debugFactory from 'debug';
import {MarkRequired} from 'ts-essentials';

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

  async findById(id: string, filter?: FilterExcludingWhere<AclRole>, options?: Options): Promise<AclRole | null> {
    return this.repo.findById(id, filter, options);
  }

  async add(attrs: MarkRequired<AclRoleAttrs, 'name' | 'resource'>, options?: OptionsWithDomain): Promise<AclRole> {
    options = {...options};
    const {name, resource} = attrs;
    const props = await this.repo.resolveAttrs(attrs, options);

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
      await tx.commit();
      return answer;
    } catch (e) {
      await tx?.rollback();
      throw e;
    }
  }

  async remove(
    role: string | EntityLike,
    resourceOrOptions?: ResourceRepresent | OptionsWithDomain,
    options?: OptionsWithDomain,
  ): Promise<DeleteResult<{Role: number; RoleActor: number}> | undefined> {
    let resource: ResourceRepresent | undefined;
    if (resourceOrOptions && isResourceRepresent(resourceOrOptions)) {
      resource = resourceOrOptions;
    } else {
      options = resourceOrOptions;
    }
    const id = role ? resolveRoleId(role, resource) : undefined;

    if (!id && !resource) {
      throw new Error('Either role(id or name) or resource must be provided.');
    }

    options = {...options};

    let roleWhere: DomainizedCondition<AclRole>;
    let roleActorWhere: DomainizedCondition<AclRoleActor>;
    if (id) {
      const type = await this.repo.hasRole(id);
      if (!type) {
        return {count: 0};
      }
      if (type === 'builtin') {
        throw new Error(`Builtin role "${parseRoleId(id).name}" cannot be removed.`);
      }
      roleWhere = (await this.repo.resolveAttrs({id}, options)) as DomainizedCondition<AclRole>;
      roleActorWhere = (await this.roleActorRepository.resolveAttrs(
        {roleId: id},
        options,
      )) as DomainizedCondition<AclRoleActor>;
    } else {
      roleWhere = (await this.repo.resolveAttrs({resource}, options)) as DomainizedCondition<AclRole>;
      roleActorWhere = (await this.roleActorRepository.resolveAttrs(
        {resource},
        options,
      )) as DomainizedCondition<AclRoleActor>;
    }

    let roleCount = 0;
    let roleActorCount = 0;
    const tx = await this.tf.beginTransaction(options);
    try {
      debug('Removing role actors %o', roleActorWhere);
      ({count: roleActorCount} = await this.roleActorRepository.deleteAll(roleActorWhere, options));
      debug('Removed %d role actors', roleActorCount);

      debug('Removing roles %o', roleWhere);
      ({count: roleCount} = await this.repo.deleteAll(roleWhere, options));
      debug('Removed %d roles', roleCount);
      await tx.commit();
      return {count: roleCount, details: {Role: roleCount, RoleActor: roleActorCount}};
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  async removeForResource(
    resource: ResourceRepresent,
    options?: OptionsWithDomain,
  ): Promise<DeleteResult<{Role: number; RoleActor: number}>> {
    options = {...options};
    const roleWhere = (await this.repo.resolveAttrs({resource}, options)) as DomainizedCondition<AclRole>;
    const roleActorWhere = (await this.roleActorRepository.resolveAttrs(
      {resource},
      options,
    )) as DomainizedCondition<AclRoleActor>;

    let roleCount = 0;
    let roleActorCount = 0;
    const tx = await this.tf.beginTransaction(options);
    try {
      ({count: roleActorCount} = await this.roleActorRepository.deleteAll(roleActorWhere, options));
      ({count: roleCount} = await this.repo.deleteAll(roleWhere, options));
      await tx.commit();
      return {count: roleCount, details: {Role: roleCount, RoleActor: roleActorCount}};
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
}
