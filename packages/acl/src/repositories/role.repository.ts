import {inject} from '@loopback/context';
import {Getter, HasManyRepositoryFactory, juggler, Options, repository} from '@loopback/repository';
import {toResourcePolymorphic} from '../helpers';
import {AclBindings} from '../keys';
import {Role, RoleAttrs, RoleMapping, RolePermission, RoleProps, RoleRelations} from '../models';
import {PolicyRegistry} from '../policies';
import {AclAuthDBName, ResourcePolymorphicOrEntity} from '../types';
import {RoleMappingRepository} from './role-mapping.repository';
import {RolePermissionRepository} from './role-permission.repository';
import {RoleBaseRepository} from './role.base.repository';

export class RoleRepository extends RoleBaseRepository<Role, typeof Role.prototype.id, RoleRelations, RoleAttrs> {
  public readonly principals: HasManyRepositoryFactory<RoleMapping, typeof RoleMapping.prototype.id>;
  public readonly permissions: HasManyRepositoryFactory<RolePermission, typeof RolePermission.prototype.id>;

  constructor(
    @inject(`datasources.${AclAuthDBName}`)
    dataSource: juggler.DataSource,
    @repository.getter('RoleMappingRepository')
    protected readonly roleMappingRepositoryGetter: Getter<RoleMappingRepository>,
    @repository.getter('RolePermissionRepository')
    protected readonly rolePermissionRepositoryGetter: Getter<RolePermissionRepository>,
    @inject(AclBindings.POLICY_REGISTRY)
    public readonly policyRegistry: PolicyRegistry,
  ) {
    super(Role, dataSource);
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
  ): Promise<Role | null> {
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
  ): Promise<string | Role | null> {
    if (this.isBuiltInRole(roleIdOrName, resource)) {
      return roleIdOrName;
    }
    return this.findByIdOrName(roleIdOrName, resource, options);
  }

  resolveProps(attrs: RoleAttrs, defaults?: RoleProps): RoleProps {
    const {resource, ...props} = {...defaults, ...attrs};
    if (resource) {
      const polymorphic = toResourcePolymorphic(resource);
      props.resourceType = polymorphic.resourceType;
      props.resourceId = polymorphic.resourceId;
    }
    return props;
  }
}
