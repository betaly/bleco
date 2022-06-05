import {AclRoleMappingRepository} from './acl-role-mapping.repository';
import {AclRolePermissionRepository} from './acl-role-permission.repository';
import {AclRoleRepository} from './acl-role.repository';

export * from './acl-role-mapping.repository';
export * from './acl-role-permission.repository';
export * from './acl-role.repository';

export const repositories = [AclRoleRepository, AclRolePermissionRepository, AclRoleMappingRepository];
