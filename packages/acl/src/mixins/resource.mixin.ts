import {Entity, hasMany} from "@loopback/repository";
import {MixinTarget} from "@loopback/core";
import {AclRole} from "../models/role.model";
import {AclRoleActor} from "../models/role-actor.model";

export function AclResourceMixin<T extends MixinTarget<Entity>>(superClass: T) {
  class MixinClass extends superClass implements AclResourcedEntity {

    @hasMany(() => AclRole, {keyTo: 'resource_id'})
    roles?: AclRole[];

    @hasMany(() => AclRoleActor, {keyTo: 'resource_id'})
    roleActors?: AclRoleActor[];
  }

  return MixinClass;
}

export interface AclResourcedEntity {
  roles?: AclRole[];
  roleActors?: AclRoleActor[];
}
