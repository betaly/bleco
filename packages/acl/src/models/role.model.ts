import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {SoftDeleteEntity} from '@bleco/soft-delete';
import {AclRoleActor} from './role-actor.model';
import {DomainAware, ObjectProps, ResourceAware, ResourceRepresent} from '../types';

@model()
export class AclRole extends SoftDeleteEntity implements DomainAware, ResourceAware {
  @property({
    type: 'string',
    id: true,
    // defaultFn: 'nanoid',
    generated: false,
  })
  id: string;

  @property()
  name: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  permissions?: string[];

  @property({
    name: 'domain_id',
  })
  domainId: string;

  @belongsTo(
    () => Entity,
    {polymorphic: {discriminator: 'resource_type'}},
    {
      name: 'resource_id',
      index: true,
    },
  )
  resourceId: string;

  @property({
    name: 'resource_type',
    index: true,
  })
  resourceType: string;

  @hasMany(() => AclRoleActor, {keyTo: 'roleId'})
  roleActors?: AclRoleActor[];
}

export interface AclRoleRelations {
  resource?: Entity;
}

export type AclRoleWithRelations = AclRole & AclRoleRelations;

export type AclRoleAttrs = ObjectProps<AclRole> & {
  resource?: ResourceRepresent;
};
