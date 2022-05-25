import {Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import {Role, RoleAttrs, RoleMapping, RolePermission, RoleProps, RoleRelations} from '../models';
import {inject} from '@loopback/context';
import {AclAuthDBName, DomainLike, OptionsWithDomain, ResourcePolymorphicOrEntity} from '../types';
import {RoleMappingRepository} from './role-mapping.repository';
import {toResourcePolymorphic} from '../helpers';
import {AclBindings} from '../keys';
import {AclBaseRepository} from './base-repository';
import {PolicyManager} from '../policy.manager';
import {RolePermissionRepository} from './role-permission.repository';

// const debug = debugFactory('bleco:acl:role-repository');

export class RoleRepository extends AclBaseRepository<Role, typeof Role.prototype.id, RoleRelations, RoleAttrs> {
  public readonly principals: HasManyRepositoryFactory<RoleMapping, typeof RoleMapping.prototype.id>;
  public readonly permissions: HasManyRepositoryFactory<RolePermission, typeof RolePermission.prototype.id>;

  constructor(
    @inject(`datasources.${AclAuthDBName}`)
    dataSource: juggler.DataSource,
    @repository.getter('RoleActorRepository')
    protected readonly roleActorRepositoryGetter: Getter<RoleMappingRepository>,
    @repository.getter('RolePermissionRepository')
    protected readonly rolePermissionRepositoryGetter: Getter<RolePermissionRepository>,
    @inject(AclBindings.POLICY_MANAGER)
    public readonly policyManager: PolicyManager,
    @inject.getter(AclBindings.DOMAIN, {optional: true})
    getDomain?: Getter<DomainLike>,
  ) {
    super(Role, dataSource, getDomain);
    this.principals = this.createHasManyRepositoryFactoryFor('principals', roleActorRepositoryGetter);
    this.registerInclusionResolver('principals', this.principals.inclusionResolver);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions', rolePermissionRepositoryGetter);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }

  isBuiltInRole(roleName: string, resourceType: string | ResourcePolymorphicOrEntity): boolean {
    resourceType = typeof resourceType === 'string' ? resourceType : toResourcePolymorphic(resourceType).resourceType;
    const policy = this.policyManager.get(resourceType);
    return !!policy.roles?.includes(roleName);
  }

  async findByIdOrName(
    roleIdOrName: string,
    resource: ResourcePolymorphicOrEntity,
    options?: OptionsWithDomain,
  ): Promise<Role | null> {
    const {resourceType, resourceId} = toResourcePolymorphic(resource);
    return this.findOne({
      where: {
        resourceType,
        resourceId,
        domain: await this.getCurrentDomain(options),
        or: [{id: roleIdOrName}, {name: roleIdOrName}],
      },
    });
  }

  async resolveRoleByIdOrName(
    roleIdOrName: string,
    resource: ResourcePolymorphicOrEntity,
    options?: OptionsWithDomain,
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
