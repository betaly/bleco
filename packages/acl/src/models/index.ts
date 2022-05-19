import {Role} from './role.model';
import {RoleMapping} from './role-mapping.model';
import {RolePermission} from './role-permission.model';

export * from './role.model';
export * from './role-permission.model';
export * from './role-mapping.model';

export const models = [Role, RolePermission, RoleMapping];
