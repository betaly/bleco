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

  @property({
    name: 'principal_id',
    index: true,
  })
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

  @property({
    name: 'resource_id',
    type: 'string',
    index: true,
  })
  resourceId?: string | null;

  @property({
    name: 'resource_type',
    type: 'string',
    index: true,
  })
  resourceType: string;

  constructor(data?: Partial<AclRoleMapping>) {
    super(data);
  }
}

export interface AclRoleMappingRelations {
  role?: AclRoleWithRelations;
}

export type AclRoleMappingWithRelations = AclRoleMapping & AclRoleMappingRelations;

export type AclRoleMappingProps = ObjectProps<Omit<AclRoleMapping, 'resource' | 'principal' | 'role'>>;
export type AclRoleMappingAttrs = AclRoleMappingProps & {
  role?: AclRole | string;
  resource?: ResourcePolymorphicOrEntity | string;
  principal?: PrincipalPolymorphicOrEntity;
};
