import {belongsTo, Entity, model, property} from '@loopback/repository';
import {AclRole} from './role.model';
import {ActorAware, DomainAware, EntityLike, ObjectProps, ResourceAware, ResourceRepresent, RoleAware} from '../types';

@model()
export class AclRoleActor extends Entity implements DomainAware, ActorAware, ResourceAware, RoleAware {
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

  @belongsTo(
    () => Entity,
    {},
    {
      name: 'actor_id',
      index: true,
    },
  )
  actorId: string;

  @belongsTo(
    () => AclRole,
    {},
    {
      name: 'role_id',
      index: true,
      description: 'The role id for custom roles or with `[resourceId]:[roleName]` format for built-in roles.',
    },
  )
  roleId?: string;

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

  constructor(data?: Partial<AclRoleActor>) {
    super(data);
  }
}

export interface AclRoleActorRelations {
  resource?: Entity;
  actor?: Entity;
  role?: AclRole;
}

export type AclRoleActorWithRelations = AclRoleActor & AclRoleActorRelations;

export type AclRoleActorProps = ObjectProps<Omit<AclRoleActor, 'resource' | 'actor' | 'role'>>;
export type AclRoleActorAttrs = AclRoleActorProps & {
  resource?: ResourceRepresent;
  actor?: EntityLike | string;
  role?: AclRole | string;
};
