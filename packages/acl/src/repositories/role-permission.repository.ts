import {QueryEnhancedCrudRepository} from '@bleco/query';
import {
  RoleMappingProps,
  RolePermission,
  RolePermissionAttrs,
  RolePermissionProps,
  RolePermissionRelations,
} from '../models';
import {inject} from '@loopback/context';
import {AclAuthDBName} from '../types';
import {juggler} from '@loopback/repository';
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
