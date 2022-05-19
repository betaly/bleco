import {ArrayOrSingle, MarkRequired} from 'ts-essentials';
import {Condition, repository, Where} from '@loopback/repository';
import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import debugFactory from 'debug';
import {AclBaseService} from './base-service';
import {DeleteResult, EntityLike, OptionsWithDomain, ResourcePolymorphicOrEntity} from '../types';
import {AclBindings} from '../keys';
import {Role, RoleAttrs, RoleMapping, RolePermission, RoleProps} from '../models';
import {generateRoleId, isResourcePolymorphicOrEntity, parseRoleId, resolveRoleId} from '../helpers';
import {PolicyManager} from '../policy.manager';
import {RoleMappingRepository, RolePermissionRepository, RoleRepository} from '../repositories';
import toArray from 'tily/array/toArray';
import {assert} from 'tily/assert';
import {RolesExistsError} from '../errors';

const debug = debugFactory('bleco:acl:role-service');

export type RoleDeleteResult = DeleteResult<{Role: number; RolePermission: number; RoleMapping: number}>;

@injectable({scope: BindingScope.SINGLETON})
export class RoleService extends AclBaseService<Role> {
  repo: RoleRepository;

  constructor(
    @repository(RoleRepository)
    repo: RoleRepository,
    @inject(AclBindings.POLICY_MANAGER)
    policyManager: PolicyManager,
    @repository(RoleMappingRepository)
    public roleMappingRepository: RoleMappingRepository,
    @repository(RolePermissionRepository)
    public rolePermissionRepository: RolePermissionRepository,
  ) {
    super(repo, policyManager);
  }

  async add(entity: MarkRequired<RoleAttrs, 'name' | 'resource'>, options?: OptionsWithDomain): Promise<Role> {
    return (await this.addAll([entity], options))[0];
  }

  async addAll(entities: MarkRequired<RoleAttrs, 'name' | 'resource'>[], options?: OptionsWithDomain): Promise<Role[]> {
    options = {...options};

    const domain = await this.repo.getCurrentDomain(options);

    const rolesProps: RoleProps[] = [];
    const rolesPermissions: (string[] | undefined)[] = [];
    const existsConditions: Condition<Role>[] = [];

    // prepare roles and rolePermissions
    toArray(entities).forEach(entity => {
      const {permissions, ...unwrappedAttrs} = entity;
      const props = this.repo.resolveProps(unwrappedAttrs, {domain});

      assert(props.name, 'Role name is required');
      assert(props.resourceType, 'Resource is required');

      if (this.repo.isBuiltInRole(props.name, props.resourceType)) {
        throw new Error(`Builtin role "${props.name}" cannot be added.`);
      }

      rolesProps.push(props);
      rolesPermissions.push(permissions);
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
   * @param role role id or role entity
   * @param options
   */
  async delete(
    role: string | EntityLike,
    options?: OptionsWithDomain,
  ): Promise<DeleteResult<{Role: number; RolePermission: number; RoleMapping: number}> | undefined> {
    options = {...options};
    const id = resolveRoleId(role);

    const type = await this.repo.hasRole(id);
    if (!type) {
      return {count: 0};
    }
    if (type === 'builtin') {
      throw new Error(`Builtin role "${parseRoleId(id).name}" cannot be deleted.`);
    }
    const domain = await this.repo.getCurrentDomain(options);
    const rolesWhere = this.repo.resolveProps({id}, {domain}) as Where<Role>;
    const roleMappingsWhere = this.roleMappingRepository.resolveProps({roleId: id}, {domain}) as Where<RoleMapping>;
    const rolePermissionsWhere = {roleId: id} as Where<RolePermission>;
    return this.deleteCascade({rolesWhere, rolePermissionsWhere, roleMappingsWhere}, options);
  }

  async deleteInResource(resource: ResourcePolymorphicOrEntity, options?: OptionsWithDomain): Promise<RoleDeleteResult>;
  async deleteInResource(
    roles: ArrayOrSingle<string>,
    resource: ResourcePolymorphicOrEntity,
    options?: OptionsWithDomain,
  ): Promise<RoleDeleteResult>;
  async deleteInResource(
    rolesOrResource: ArrayOrSingle<string> | ResourcePolymorphicOrEntity,
    resourceOrOptions?: ResourcePolymorphicOrEntity | OptionsWithDomain,
    options?: OptionsWithDomain,
  ): Promise<RoleDeleteResult> {
    let roles: string[] | undefined;
    let resource: ResourcePolymorphicOrEntity;
    if (isResourcePolymorphicOrEntity(rolesOrResource)) {
      resource = rolesOrResource;
      options = resourceOrOptions as OptionsWithDomain;
    } else {
      roles = toArray(rolesOrResource);
      resource = resourceOrOptions as ResourcePolymorphicOrEntity;
    }
    options = {...options};

    const domain = await this.repo.getCurrentDomain(options);
    const roleWhere = this.repo.resolveProps({resource}, {domain}) as Condition<Role>;
    const roleActorWhere = this.roleMappingRepository.resolveProps({resource}, {domain}) as Condition<RoleMapping>;
    const rolePermissions = {roleId: {like: generateRoleId('%', resource)}} as Condition<RolePermission>;

    let ids: string[] | undefined;
    if (roles && !roles.find(role => role === '*')) {
      ids = roles.map(role => resolveRoleId(role, resource));
    }
    if (ids) {
      roleWhere.id = {inq: ids};
      roleActorWhere.roleId = {inq: ids};
      rolePermissions.roleId = {inq: ids};
    }

    return this.deleteCascade(
      {
        rolesWhere: roleWhere,
        rolePermissionsWhere: rolePermissions,
        roleMappingsWhere: roleActorWhere,
      },
      options,
    );
  }

  async updatePermissions(roleId: string, permissions: string[], options?: OptionsWithDomain) {
    options = {...options};
    const domain = await this.repo.getCurrentDomain(options);
    const tx = await this.tf.beginTransaction(options);
    try {
      await this.rolePermissionRepository.deleteAll({roleId}, options);
      if (permissions.length) {
        await this.rolePermissionRepository.createAll(
          permissions.map(permission => ({roleId, permission, domain})),
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
    options: OptionsWithDomain,
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
