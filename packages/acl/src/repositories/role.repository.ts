import {DataObject, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import {Role, RoleAttrs, RoleMapping, RolePermission, RoleProps, RoleRelations} from '../models';
import {inject} from '@loopback/context';
import {
  AclAuthDBName,
  DomainLike,
  OptionsWithDomain,
  ResourcePolymorphic,
  ResourcePolymorphicOrEntity,
  RoleType,
} from '../types';
import {RoleMappingRepository} from './role-mapping.repository';
import {generateRoleId, parseRoleId, toResourcePolymorphic} from '../helpers';
import debugFactory from 'debug';
import {AclBindings} from '../keys';
import {AclBaseRepository} from './base-repository';
import {PolicyManager} from '../policy.manager';
import {RolePermissionRepository} from './role-permission.repository';

const debug = debugFactory('bleco:acl:role-repository');

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

  definePersistedModel(entityClass: typeof Role) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      const instance = ctx.instance as DataObject<Role>;
      if (instance && !instance.id) {
        if (!instance.name || !instance.resourceType || !instance.resourceId) {
          throw new Error('role name, resourceType and resourceId are required to generate role id');
        }
        instance.id = generateRoleId(instance.name, instance as ResourcePolymorphic);
        debug('generated role id: %s', instance.id);
      }
    });
    return modelClass;
  }

  isBuiltInRole(roleNameOrId: string, resourceType: string): boolean {
    // eslint-disable-next-line prefer-const
    let {name} = parseRoleId(roleNameOrId);
    const policy = this.policyManager.get(resourceType);
    return !!policy.roles?.includes(name);
  }

  async hasRole(
    roleNameOrId: string,
    resource?: ResourcePolymorphicOrEntity,
    options?: OptionsWithDomain,
  ): Promise<RoleType | boolean> {
    // eslint-disable-next-line prefer-const
    let {resourceId, resourceType, name} = parseRoleId(roleNameOrId);
    if (!resourceType) {
      if (!resource) {
        throw new Error('Resource is required when role name is not a full role id');
      }
      ({resourceType, resourceId} = toResourcePolymorphic(resource));
    }
    const policy = this.policyManager.get(resourceType);
    if (policy.roles?.includes(name)) {
      return 'builtin';
    }
    const role = await this.findOne({
      where: {
        name,
        resourceType,
        resourceId,
        domain: await this.getCurrentDomain(options),
      },
    });

    return role ? 'custom' : false;
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
