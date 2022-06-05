import {belongsTo, Entity, model, property} from '@loopback/repository';
import {
  DomainAware,
  ObjectProps,
  PrincipalAware,
  PrincipalPolymorphicOrEntity,
  ResourceAware,
  ResourcePolymorphicOrEntity,
  RoleAware,
} from '../types';
import {AclRole, AclRoleWithRelations} from './acl-role.model';
import {AclPrincipal, AclResource} from './models';

@model()
export class AclRoleMapping extends Entity implements DomainAware, PrincipalAware, ResourceAware, RoleAware {
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
    () => AclRole,
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

  constructor(data?: Partial<AclRoleMapping>) {
    super(data);
  }

  isRole(name: string): boolean {
    return this.roleId.endsWith(':' + name);
  }
}

export interface AclRoleMappingRelations {
  role?: AclRoleWithRelations;
  resource?: AclResource;
  principal?: AclPrincipal;
}

export type AclRoleMappingWithRelations = AclRoleMapping & AclRoleMappingRelations;

export type AclRoleMappingProps = ObjectProps<Omit<AclRoleMapping, 'resource' | 'principal' | 'role'>>;
export type AclRoleMappingAttrs = AclRoleMappingProps & {
  role?: AclRole | string;
  resource?: ResourcePolymorphicOrEntity;
  principal?: PrincipalPolymorphicOrEntity;
};
