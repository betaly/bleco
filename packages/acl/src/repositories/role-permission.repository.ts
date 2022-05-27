import {QueryEnhancedCrudRepository} from '@bleco/query';
import {inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {
  RoleMappingProps,
  RolePermission,
  RolePermissionAttrs,
  RolePermissionProps,
  RolePermissionRelations,
} from '../models';
import {AclAuthDBName} from '../types';
import {resolveRoleId, toResourcePolymorphic} from '../helpers';

export class RolePermissionRepository extends QueryEnhancedCrudRepository<
  RolePermission,
  typeof RolePermission.prototype.id,
  RolePermissionRelations
> {
  constructor(
    @inject(`datasources.${AclAuthDBName}`)
    dataSource: juggler.DataSource,
  ) {
    super(RolePermission, dataSource);
  }

  resolveProps(attrs: RolePermissionAttrs, defaults?: RoleMappingProps): RolePermissionProps {
    const {resource, role, ...props} = {...defaults, ...attrs};
    if (resource) {
      Object.assign(props, toResourcePolymorphic(resource));
    }
    if (role) {
      props.roleId = resolveRoleId(role);
    }
    return props;
  }
}
