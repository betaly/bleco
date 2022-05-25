import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import {AclRoleMappingRelations, Role, RoleMapping, RoleMappingAttrs, RoleMappingProps} from '../models';
import {inject} from '@loopback/context';
import {AclAuthDBName, DomainLike} from '../types';
import {RoleRepository} from './role.repository';
import {AclBindings} from '../keys';
import {resolveRoleId, toPrincipalPolymorphic, toResourcePolymorphic} from '../helpers';
import {AclBaseRepository} from './base-repository';

export class RoleMappingRepository extends AclBaseRepository<
  RoleMapping,
  typeof RoleMapping.prototype.id,
  AclRoleMappingRelations,
  RoleMappingAttrs
> {
  public readonly role: BelongsToAccessor<Role, typeof Role.prototype.id>;

  constructor(
    @inject(`datasources.${AclAuthDBName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AclRoleRepository')
    protected readonly roleRepositoryGetter: Getter<RoleRepository>,
    @inject.getter(AclBindings.DOMAIN, {optional: true})
    getDomain?: Getter<DomainLike>,
  ) {
    super(RoleMapping, dataSource, getDomain);

    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
  }

  resolveProps(attrs: RoleMappingAttrs, defaults?: RoleMappingProps): RoleMappingProps {
    const {principal, resource, role, ...props} = {...defaults, ...attrs};
    if (principal) {
      Object.assign(props, toPrincipalPolymorphic(principal));
    }
    if (resource) {
      Object.assign(props, toResourcePolymorphic(resource));
    }
    if (role) {
      props.roleId = resolveRoleId(role);
    }
    return props;
  }
}
