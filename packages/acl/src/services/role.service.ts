import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import {Condition, Options, repository, Where} from '@loopback/repository';
import debugFactory from 'debug';
import toArray from 'tily/array/toArray';
import {assert} from 'tily/assert';
import {ArrayOrSingle, MarkRequired} from 'ts-essentials';
import {RolesExistsError} from '../errors';
import {resolveRoleId} from '../helpers';
import {AclBindings} from '../keys';
import {Role, RoleAttrs, RoleMapping, RolePermission, RoleProps} from '../models';
import {PolicyRegistry} from '../policies';
import {RoleMappingRepository, RolePermissionRepository, RoleRepository} from '../repositories';
import {DeleteResult, EntityLike, GlobalDomain, ResourcePolymorphicOrEntity} from '../types';
import {RoleBaseService} from './role.base.service';

const debug = debugFactory('bleco:acl:role-service');

export type RoleInput = MarkRequired<RoleAttrs, 'name' | 'resource'>;

export type RoleDeleteResult = DeleteResult<{Role: number; RolePermission: number; RoleMapping: number}>;

@injectable({scope: BindingScope.SINGLETON})
export class RoleService extends RoleBaseService<Role> {
  repo: RoleRepository;

  constructor(
    @repository(RoleRepository)
    repo: RoleRepository,
    @inject(AclBindings.POLICY_REGISTRY)
    policyRegistry: PolicyRegistry,
    @repository(RoleMappingRepository)
    public roleMappingRepository: RoleMappingRepository,
    @repository(RolePermissionRepository)
    public rolePermissionRepository: RolePermissionRepository,
  ) {
    super(repo, policyRegistry);
  }

  async add(entity: RoleInput, options?: Options): Promise<Role> {
    return this.addInDomain(entity, GlobalDomain, options);
  }

  async addAll(entities: RoleInput[], options?: Options): Promise<Role[]> {
    return this.addAllInDomain(entities, GlobalDomain, options);
  }

  /**
   * Remove one role
   * @param roles role ids or role entities
   * @param options
   */
  async delete(
    roles: ArrayOrSingle<string | EntityLike>,
    options?: Options,
  ): Promise<DeleteResult<{Role: number; RolePermission: number; RoleMapping: number}> | undefined> {
    return this.deleteInDomain(roles, GlobalDomain, options);
  }

  async deleteForResource(resource: ResourcePolymorphicOrEntity, options?: Options): Promise<RoleDeleteResult> {
    return this.deleteForResourceInDomain(resource, GlobalDomain, options);
  }

  async updatePermissions(roleOrId: string | Role, permissions: string[], options?: Options) {
    return this.updatePermissionsInDomain(roleOrId, permissions, GlobalDomain, options);
  }

  async addInDomain(entity: RoleInput, domain: string, options?: Options): Promise<Role> {
    return (await this.addAllInDomain([entity], domain, options))[0];
  }

  async addAllInDomain(entities: RoleInput[], domain: string, options?: Options): Promise<Role[]> {
    options = {...options};

    const rolesProps: RoleProps[] = [];
    const rolesPermissions: (string[] | undefined)[] = [];
    const existsConditions: Condition<Role>[] = [];

    // prepare roles and rolePermissions
    toArray(entities).forEach(entity => {
      const {actions, ...unwrappedAttrs} = entity;
      const props = this.repo.resolveProps(unwrappedAttrs, {domain});

      assert(props.name, 'Role name is required');
      assert(props.resourceType, 'Resource is required');

      if (this.repo.isBuiltInRole(props.name, props.resourceType)) {
        throw new Error(`Builtin role "${props.name}" cannot be added.`);
      }

      rolesProps.push(props);
      rolesPermissions.push(actions);
      existsConditions.push(props);
    });

    const tx = await this.tf.beginTransaction(options);
    try {
      await (async () => {
        const founds = await this.repo.find(
          {
            where: {or: existsConditions},
            fields: ['id', 'name', 'resourceType', 'resourceId'],
          },
          options,
        );
        if (founds.length > 0) {
          throw new RolesExistsError(founds.map(({id}) => id));
        }
      })();

      const roles = await this.repo.createAll(rolesProps, options);
      for (let i = 0; i < rolesPermissions.length; i++) {
        const permissions = rolesPermissions[i];
        if (!permissions) {
          continue;
        }
        await this.updatePermissions(roles[i].id, permissions, options);
      }
      await tx.commit();
      return roles;
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }

  /**
   * Remove one role
   */
  async deleteInDomain(
    roles: ArrayOrSingle<string | EntityLike>,
    domain: string,
    options?: Options,
  ): Promise<DeleteResult<{Role: number; RolePermission: number; RoleMapping: number}> | undefined> {
    options = {...options};
    const ids = toArray(roles).map(role => resolveRoleId(role));
    const rolesWhere = {
      id: {inq: ids},
      domain,
    } as Where<Role>;
    const roleMappingsWhere = {
      roleId: {inq: ids},
      domain,
    } as Where<RoleMapping>;
    const rolePermissionsWhere = {
      roleId: {inq: ids},
      domain,
    } as Where<RolePermission>;
    return this.deleteCascade({rolesWhere, rolePermissionsWhere, roleMappingsWhere}, options);
  }

  async deleteForResourceInDomain(
    resource: ResourcePolymorphicOrEntity,
    domain: string,
    options?: Options,
  ): Promise<RoleDeleteResult> {
    options = {...options};
    const roleWhere = this.repo.resolveProps({resource}, {domain}) as Condition<Role>;
    const roleMappingWhere = this.roleMappingRepository.resolveProps({resource}, {domain}) as Condition<RoleMapping>;
    const rolePermissionsWhere = this.rolePermissionRepository.resolveProps(
      {resource},
      {domain},
    ) as Condition<RolePermission>;

    return this.deleteCascade(
      {
        rolesWhere: roleWhere,
        rolePermissionsWhere: rolePermissionsWhere,
        roleMappingsWhere: roleMappingWhere,
      },
      options,
    );
  }

  async updatePermissionsInDomain(roleOrId: string | Role, permissions: string[], domain: string, options?: Options) {
    options = {...options};
    const tx = await this.tf.beginTransaction(options);
    try {
      const role = typeof roleOrId === 'string' ? await this.repo.findById(roleOrId, {}, options) : roleOrId;
      await this.rolePermissionRepository.deleteAll({roleId: role.id}, options);
      if (permissions.length) {
        await this.rolePermissionRepository.createAll(
          permissions.map(permission => ({
            roleId: role.id,
            resourceType: role.resourceType,
            resourceId: role.resourceId,
            action: permission,
            domain,
          })),
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
    where: {
      rolesWhere: Where<Role>;
      rolePermissionsWhere: Where<RolePermission>;
      roleMappingsWhere: Where<RoleMapping>;
    },
    options: Options,
  ): Promise<RoleDeleteResult> {
    let roleCount = 0;
    let rolePermissionCount = 0;
    let roleActorCount = 0;
    const tx = await this.tf.beginTransaction(options);
    try {
      debug('Deleting role mappings %o', where.roleMappingsWhere);
      ({count: roleActorCount} = await this.roleMappingRepository.deleteAll(where.roleMappingsWhere, options));
      debug('Deleted %d role mappings', roleActorCount);

      debug('Deleting role permissions %o', where.rolePermissionsWhere);
      ({count: rolePermissionCount} = await this.rolePermissionRepository.deleteAll(
        where.rolePermissionsWhere,
        options,
      ));
      debug('Deleted %d role permissions', roleCount);

      debug('Deleting roles %o', where.rolesWhere);
      ({count: roleCount} = await this.repo.deleteAll(where.rolesWhere, options));
      debug('Deleted %d roles', roleCount);
      await tx.commit();
      return {
        count: roleCount,
        details: {Role: roleCount, RolePermission: rolePermissionCount, RoleMapping: roleActorCount},
      };
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  }
}
