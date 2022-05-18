import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import {AclRole, AclRoleActor, AclRoleActorAttrs, AclRoleActorRelations} from '../models';
import {inject} from '@loopback/context';
import {AclDataSourceName, DomainLike, ObjectProps, OptionsWithDomain} from '../types';
import {AclRoleRepository} from './role.repository';
import {AclBindings} from '../keys';
import {resolveEntityId, resolveResourcePolymorphic, resolveRoleId} from '../helpers';
import {AclBaseRepository} from './base-repository';

export class AclRoleActorRepository extends AclBaseRepository<
  AclRoleActor,
  typeof AclRoleActor.prototype.id,
  AclRoleActorRelations,
  AclRoleActorAttrs
> {
  public readonly role: BelongsToAccessor<AclRole, typeof AclRole.prototype.id>;

  constructor(
    @inject(`datasources.${AclDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AclRoleRepository')
    protected readonly roleRepositoryGetter: Getter<AclRoleRepository>,
    @inject.getter(AclBindings.DOMAIN, {optional: true})
    readonly getDomain?: Getter<DomainLike>,
  ) {
    super(AclRoleActor, dataSource, getDomain);

    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
  }

  async resolveAttrs(attrs: AclRoleActorAttrs, options?: OptionsWithDomain): Promise<ObjectProps<AclRoleActor>> {
    const {actor, resource, role, ...props} = attrs;
    if (actor) {
      props.actorId = resolveEntityId(actor);
    }
    if (resource) {
      const polymorphic = resolveResourcePolymorphic(resource);
      props.resourceType = polymorphic.resourceType;
      props.resourceId = polymorphic.resourceId;
    }
    if (role) {
      props.roleId = resolveRoleId(role, resource);
    }
    props.domainId = props.domainId ?? (await this.resolveDomainId(options));
    return props;
  }
}
