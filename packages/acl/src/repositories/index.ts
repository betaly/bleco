import {AclRoleRepository} from './role.repository';
import {AclRoleActorRepository} from './role-actor.repository';

export * from './role.repository';
export * from './role-actor.repository';

export const repositories = [AclRoleRepository, AclRoleActorRepository];
