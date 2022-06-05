import {inject} from '@loopback/context';
import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import {resolveRoleId, toPrincipalPolymorphic, toResourcePolymorphic} from '../helpers';
import {Role, RoleMapping, RoleMappingAttrs, RoleMappingProps, RoleMappingRelations} from '../models';
import {AclAuthDBName} from '../types';
import {RoleBaseRepository} from './role.base.repository';
import {RoleRepository} from './role.repository';

export class RoleMappingRepository extends RoleBaseRepository<
  RoleMapping,
  typeof RoleMapping.prototype.id,
  RoleMappingRelations,
  RoleMappingAttrs
> {
  public readonly role: BelongsToAccessor<Role, typeof Role.prototype.id>;

  constructor(
    @inject(`datasources.${AclAuthDBName}`)
    dataSource: juggler.DataSource,
    @repository.getter('RoleRepository')
    protected readonly roleRepositoryGetter: Getter<RoleRepository>,
  ) {
    super(RoleMapping, dataSource);

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
