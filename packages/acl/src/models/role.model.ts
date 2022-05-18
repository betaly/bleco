import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {AclRoleActor} from './role-actor.model';
import {DomainAware, ObjectProps, ResourceAware, ResourceRepresent} from '../types';
import {AclRolePermission} from '../models';

@model()
export class AclRole extends Entity implements DomainAware, ResourceAware {
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

  @hasMany(() => AclRolePermission, {keyTo: 'roleId'})
  permissions?: AclRolePermission[];

  @hasMany(() => AclRoleActor, {keyTo: 'roleId'})
  roleActors?: AclRoleActor[];
}

export interface AclRoleRelations {
  resource?: Entity;
}

export type AclRoleWithRelations = AclRole & AclRoleRelations;

export type AclRoleProps = ObjectProps<Omit<AclRole, 'permissions' | 'roleActors'>>;
export type AclRoleAttrs = AclRoleProps & {
  resource?: ResourceRepresent;
  permissions?: string[];
};
