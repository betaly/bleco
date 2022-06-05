import {RoleMapping} from './role-mapping.model';
import {RolePermission} from './role-permission.model';
import {Role} from './role.model';

export * from './role-mapping.model';
export * from './role-permission.model';
export * from './role.model';

export const models = [Role, RolePermission, RoleMapping];
