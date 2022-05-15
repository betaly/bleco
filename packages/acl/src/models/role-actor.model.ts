import {belongsTo, Entity, model, property} from "@loopback/repository";
import {AclRole} from "./role.model";

@model()
export class AclRoleActor extends Entity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'nanoid',
  })
  id: string;

  @property({
    name: 'domain_id',
  })
  domainId: string;

  @property({
    index: true,
    required: false,
    description: 'The role name for built-in roles. Otherwise, the role name will be null.',
  })
  name?: string;

  @belongsTo(() => Entity, {keyFrom: 'actor_id'}, {
    name: 'actor_id',
    index: true
  })
  actorId: string;

  @belongsTo(() => AclRole, {keyFrom: 'role_id'}, {
    name: 'role_id',
    index: true,
    description: 'The role id for custom roles. Otherwise, the role id will be null.',
  })
  roleId?: string;

  @belongsTo(() => Entity, {keyFrom: 'resource_id', polymorphic: {discriminator: 'resource_type'}}, {
    name: 'resource_id',
    index: true
  })
  resourceId: string;

  @property({
    name: 'resource_type',
    index: true,

  })
  resourceType: string;

  constructor(data?: Partial<AclRoleActor>) {
    super(data);
  }
}

export interface AclRoleActorRelations {
  actor?: Entity;
  role?: AclRole;
}

export type AclRoleActorWithRelations = AclRoleActor & AclRoleActorRelations;

