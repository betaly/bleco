import {inject} from '@loopback/context';
import {Getter, HasManyRepositoryFactory, juggler, Options, repository} from '@loopback/repository';
import {toResourcePolymorphic} from '../helpers';
import {AclBindings} from '../keys';
import {AclRole, AclRoleAttrs, AclRoleMapping, AclRolePermission, AclRoleProps, AclRoleRelations} from '../models';
import {PolicyRegistry} from '../policies';
import {AclAuthDBName, ResourcePolymorphicOrEntity} from '../types';
import {AclRoleMappingRepository} from './acl-role-mapping.repository';
import {AclRolePermissionRepository} from './acl-role-permission.repository';
import {RoleBaseRepository} from './role.base.repository';

export class AclRoleRepository extends RoleBaseRepository<
  AclRole,
  typeof AclRole.prototype.id,
  AclRoleRelations,
  AclRoleAttrs
> {
  public readonly principals: HasManyRepositoryFactory<AclRoleMapping, typeof AclRoleMapping.prototype.id>;
  public readonly permissions: HasManyRepositoryFactory<AclRolePermission, typeof AclRolePermission.prototype.id>;

  constructor(
    @inject(`datasources.${AclAuthDBName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AclRoleMappingRepository')
    protected readonly roleMappingRepositoryGetter: Getter<AclRoleMappingRepository>,
    @repository.getter('AclRolePermissionRepository')
    protected readonly rolePermissionRepositoryGetter: Getter<AclRolePermissionRepository>,
    @inject(AclBindings.POLICY_REGISTRY)
    public readonly policyRegistry: PolicyRegistry,
  ) {
    super(AclRole, dataSource);
    this.principals = this.createHasManyRepositoryFactoryFor('principals', roleMappingRepositoryGetter);
    this.registerInclusionResolver('principals', this.principals.inclusionResolver);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions', rolePermissionRepositoryGetter);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }

  isBuiltInRole(roleName: string, resourceType: string | ResourcePolymorphicOrEntity): boolean {
    resourceType = typeof resourceType === 'string' ? resourceType : toResourcePolymorphic(resourceType).resourceType;
    const policy = this.policyRegistry.get(resourceType);
    return !!policy.roles?.includes(roleName);
  }

  async findByIdOrName(
    roleIdOrName: string,
    resource: ResourcePolymorphicOrEntity,
    options?: Options,
  ): Promise<AclRole | null> {
    const {resourceType, resourceId} = toResourcePolymorphic(resource);
    return this.findOne(
      {
        where: {
          resourceType,
          resourceId,
          or: [{id: roleIdOrName}, {name: roleIdOrName}],
        },
      },
      options,
    );
  }

  async resolveRoleByIdOrName(
    roleIdOrName: string,
    resource: ResourcePolymorphicOrEntity,
    options?: Options,
  ): Promise<string | AclRole | null> {
    if (this.isBuiltInRole(roleIdOrName, resource)) {
      return roleIdOrName;
    }
    return this.findByIdOrName(roleIdOrName, resource, options);
  }

  resolveProps(attrs: AclRoleAttrs, defaults?: AclRoleProps): AclRoleProps {
    const {resource, ...props} = {...defaults, ...attrs};
    if (resource) {
      const polymorphic = toResourcePolymorphic(resource);
      props.resourceType = polymorphic.resourceType;
      props.resourceId = polymorphic.resourceId;
    }
    return props;
  }
}
