import {AclRoleRepository} from './role.repository';
import {AclRoleActorRepository} from './role-actor.repository';
import {AclRolePermissionRepository} from './role-permission.repository';

export * from './role.repository';
export * from './role-permission.repository';
export * from './role-actor.repository';

export const repositories = [AclRoleRepository, AclRolePermissionRepository, AclRoleActorRepository];
