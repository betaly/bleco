import {DataObject, Getter, HasManyRepositoryFactory, juggler, repository} from '@loopback/repository';
import {AclRole, AclRoleActor, AclRoleAttrs, AclRolePermission, AclRoleProps, AclRoleRelations} from '../models';
import {inject} from '@loopback/context';
import {
  AclDataSourceName,
  DomainLike,
  OptionsWithDomain,
  ResourcePolymorphic,
  ResourceRepresent,
  RoleType,
} from '../types';
import {AclRoleActorRepository} from './role-actor.repository';
import {generateRoleId, parseRoleId, resolveResourcePolymorphic} from '../helpers';
import debugFactory from 'debug';
import {AclBindings} from '../keys';
import {AclBaseRepository} from './base-repository';
import {PolicyManager} from '../policy.manager';
import {AclRolePermissionRepository} from './role-permission.repository';

const debug = debugFactory('bleco:acl:role-repository');

export class AclRoleRepository extends AclBaseRepository<
  AclRole,
  typeof AclRole.prototype.id,
  AclRoleRelations,
  AclRoleAttrs
> {
  public readonly roleActors: HasManyRepositoryFactory<AclRoleActor, typeof AclRoleActor.prototype.id>;
  public readonly permissions: HasManyRepositoryFactory<AclRolePermission, typeof AclRolePermission.prototype.id>;

  constructor(
    @inject(`datasources.${AclDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AclRoleActorRepository')
    protected readonly roleActorRepositoryGetter: Getter<AclRoleActorRepository>,
    @repository.getter('AclRolePermissionRepository')
    protected readonly rolePermissionRepositoryGetter: Getter<AclRolePermissionRepository>,
    @inject(AclBindings.POLICY_MANAGER)
    public readonly policyManager: PolicyManager,
    @inject.getter(AclBindings.DOMAIN, {optional: true})
    readonly getDomain?: Getter<DomainLike>,
  ) {
    super(AclRole, dataSource, getDomain);
    this.roleActors = this.createHasManyRepositoryFactoryFor('roleActors', roleActorRepositoryGetter);
    this.registerInclusionResolver('roleActors', this.roleActors.inclusionResolver);
    this.permissions = this.createHasManyRepositoryFactoryFor('permissions', rolePermissionRepositoryGetter);
    this.registerInclusionResolver('permissions', this.permissions.inclusionResolver);
  }

  definePersistedModel(entityClass: typeof AclRole) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      const instance = ctx.instance as DataObject<AclRole>;
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

  async hasRole(
    roleNameOrId: string,
    resource?: ResourceRepresent,
    options?: OptionsWithDomain,
  ): Promise<RoleType | boolean> {
    // eslint-disable-next-line prefer-const
    let {resourceId, resourceType, name} = parseRoleId(roleNameOrId);
    if (!resourceType) {
      if (!resource) {
        throw new Error('Resource is required when role name is not a full role id');
      }
      ({resourceType, resourceId} = resolveResourcePolymorphic(resource));
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
        domainId: await this.resolveDomainId(options),
      },
    });

    return role ? 'custom' : false;
  }

  async resolveAttrs(attrs: AclRoleAttrs, options?: OptionsWithDomain): Promise<AclRoleProps> {
    const {resource, ...props} = attrs;
    if (resource) {
      const polymorphic = resolveResourcePolymorphic(resource);
      props.resourceType = polymorphic.resourceType;
      props.resourceId = polymorphic.resourceId;
    }
    props.domainId = props.domainId ?? (await this.resolveDomainId(options));
    return props;
  }
}
