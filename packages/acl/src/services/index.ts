import {AclRoleService} from "./role.service";
import {AclRoleActorService} from "./role-actor.service";

export * from './role.service';
export * from './role-actor.service';

export const services = [AclRoleService, AclRoleActorService];
