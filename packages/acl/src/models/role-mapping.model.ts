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
import {AclPrincipal, AclResource} from './models';

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
    () => AclPrincipal,
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
      description: 'The role id for custom roles or  built-in roles.',
    },
  )
  roleId: string;

  @belongsTo(
    () => AclResource,
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

  isRole(name: string): boolean {
    return this.roleId.endsWith(':' + name);
  }
}

export interface AclRoleMappingRelations {
  role?: Role;
  resource?: AclResource;
  principal?: AclPrincipal;
}

export type RoleMappingWithRelations = RoleMapping & AclRoleMappingRelations;

export type RoleMappingProps = ObjectProps<Omit<RoleMapping, 'resource' | 'principal' | 'role'>>;
export type RoleMappingAttrs = RoleMappingProps & {
  role?: Role | string;
  resource?: ResourcePolymorphicOrEntity;
  principal?: PrincipalPolymorphicOrEntity;
};
