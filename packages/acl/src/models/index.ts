import {AclRoleMapping} from './acl-role-mapping.model';
import {AclRolePermission} from './acl-role-permission.model';
import {AclRole} from './acl-role.model';

export * from './acl-role-mapping.model';
export * from './acl-role-permission.model';
export * from './acl-role.model';

export const models = [AclRole, AclRolePermission, AclRoleMapping];
