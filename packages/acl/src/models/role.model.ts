import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {AclRoleActor} from './role-actor.model';

@model()
export class AclRole extends Entity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'nanoid',
  })
  id?: string;

  @property({
    name: 'domain_id',
  })
  domainId: string;

  @property()
  name: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  permissions?: string[];

  @belongsTo(() => Entity, {keyFrom: 'resource_id', polymorphic: {discriminator: 'resource_type'}}, {
    name: 'resource_id',
    index: true
  })
  resourceId?: string;

  @property({
    name: 'resource_type',
    index: true,
  })
  resourceType?: string;

  @hasMany(() => AclRoleActor, {keyTo: 'role_id'})
  roleActors?: AclRoleActor[];
}

export interface AclRoleRelations {
  resource?: Entity;
}

export type AclRoleWithRelations = AclRole & AclRoleRelations;
