import {inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {resolveRoleId, toResourcePolymorphic} from '../helpers';
import {
  AclRoleMappingProps,
  AclRolePermission,
  AclRolePermissionAttrs,
  AclRolePermissionProps,
  AclRolePermissionRelations,
} from '../models';
import {AclAuthDBName} from '../types';

export class AclRolePermissionRepository extends QueryEnhancedCrudRepository<
  AclRolePermission,
  typeof AclRolePermission.prototype.id,
  AclRolePermissionRelations
> {
  constructor(
    @inject(`datasources.${AclAuthDBName}`)
    dataSource: juggler.DataSource,
  ) {
    super(AclRolePermission, dataSource);
  }

  resolveProps(attrs: AclRolePermissionAttrs, defaults?: AclRoleMappingProps): AclRolePermissionProps {
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
