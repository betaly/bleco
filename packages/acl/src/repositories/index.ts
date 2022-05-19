import {RoleRepository} from './role.repository';
import {RoleMappingRepository} from './role-mapping.repository';
import {RolePermissionRepository} from './role-permission.repository';

export * from './role.repository';
export * from './role-permission.repository';
export * from './role-mapping.repository';

export const repositories = [RoleRepository, RolePermissionRepository, RoleMappingRepository];
