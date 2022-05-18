import {AclRole} from './role.model';
import {AclRoleActor} from './role-actor.model';
import {AclRolePermission} from './role-permission.model';

export * from './role.model';
export * from './role-permission.model';
export * from './role-actor.model';

export const models = [AclRole, AclRolePermission, AclRoleActor];
