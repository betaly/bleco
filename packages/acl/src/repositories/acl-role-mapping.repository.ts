import {inject} from '@loopback/context';
import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';
import {resolveRoleId, toPrincipalPolymorphic, toResourcePolymorphic} from '../helpers';
import {AclRole, AclRoleMapping, AclRoleMappingAttrs, AclRoleMappingProps, AclRoleMappingRelations} from '../models';
import {AclAuthDBName} from '../types';
import {AclRoleRepository} from './acl-role.repository';
import {RoleBaseRepository} from './role.base.repository';

export class AclRoleMappingRepository extends RoleBaseRepository<
  AclRoleMapping,
  typeof AclRoleMapping.prototype.id,
  AclRoleMappingRelations,
  AclRoleMappingAttrs
> {
  public readonly role: BelongsToAccessor<AclRole, typeof AclRole.prototype.id>;

  constructor(
    @inject(`datasources.${AclAuthDBName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AclRoleRepository')
    protected readonly roleRepositoryGetter: Getter<AclRoleRepository>,
  ) {
    super(AclRoleMapping, dataSource);

    this.role = this.createBelongsToAccessorFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
  }

  resolveProps(attrs: AclRoleMappingAttrs, defaults?: AclRoleMappingProps): AclRoleMappingProps {
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
