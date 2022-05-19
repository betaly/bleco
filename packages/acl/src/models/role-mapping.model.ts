import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Role} from './role.model';
import {
  DomainAware,
  ObjectProps,
  PrincipalAware,
  PrincipalPolymorphicOrEntity,
  ResourceAware,
  ResourcePolymorphicOrEntity,
  RoleAware,
} from '../types';

@model()
export class RoleMapping extends Entity implements DomainAware, PrincipalAware, ResourceAware, RoleAware {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'nanoid',
  })
  id: string;

  @property({
    index: true,
  })
  domain: string;

  @belongsTo(
    () => Entity,
    {polymorphic: {discriminator: 'principal_type'}},
    {
      name: 'principal_id',
      index: true,
    },
  )
  principalId: string;

  @property({
    name: 'principal_type',
    index: true,
  })
  principalType: string;

  @belongsTo(
    () => Role,
    {},
    {
      name: 'role_id',
      index: true,
      description:
        'The role id for custom roles or with `[resourceType]:[resourceId]:[roleName]` format for built-in roles.',
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

  constructor(data?: Partial<RoleMapping>) {
    super(data);
  }
}

export interface AclRoleMappingRelations {
  resource?: Entity;
  principal?: Entity;
  role?: Role;
}

export type RoleMappingWithRelations = RoleMapping & AclRoleMappingRelations;

export type RoleMappingProps = ObjectProps<Omit<RoleMapping, 'resource' | 'principal' | 'role'>>;
export type RoleMappingAttrs = RoleMappingProps & {
  resource?: ResourcePolymorphicOrEntity;
  principal?: PrincipalPolymorphicOrEntity;
  role?: Role | string;
};
