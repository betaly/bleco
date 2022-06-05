import {belongsTo, Entity, model, property} from '@loopback/repository';
import {DomainAware, ObjectProps, ResourcePolymorphicOrEntity} from '../types';
import {AclResource} from './models';
import {Role} from './role.model';

@model()
export class RolePermission extends Entity implements DomainAware {
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
    () => Role,
    {},
    {
      name: 'role_id',
      index: true,
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

  @property({
    index: true,
  })
  action: string;

  constructor(data?: Partial<RolePermission>) {
    super(data);
  }
}

export interface RolePermissionRelations {
  role?: Role;
  resource?: AclResource;
}

export type RolePermissionWithRelations = RolePermission & RolePermissionRelations;

export type RolePermissionProps = ObjectProps<Omit<RolePermission, 'roles' | 'resource'>>;
export type RolePermissionAttrs = RolePermissionProps & {
  role?: Role | string;
  resource?: ResourcePolymorphicOrEntity;
};
