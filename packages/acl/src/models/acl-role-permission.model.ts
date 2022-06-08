import {belongsTo, Entity, model, property} from '@loopback/repository';
import {DomainAware, ObjectProps, ResourcePolymorphicOrEntity} from '../types';
import {AclRole} from './acl-role.model';

@model()
export class AclRolePermission extends Entity implements DomainAware {
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
    () => AclRole,
    {},
    {
      name: 'role_id',
      index: true,
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

  @property({
    index: true,
  })
  action: string;

  constructor(data?: Partial<AclRolePermission>) {
    super(data);
  }
}

export interface AclRolePermissionRelations {
  role?: AclRole;
}

export type AclRolePermissionWithRelations = AclRolePermission & AclRolePermissionRelations;

export type AclRolePermissionProps = ObjectProps<Omit<AclRolePermission, 'roles' | 'resource'>>;
export type AclRolePermissionAttrs = AclRolePermissionProps & {
  role?: AclRole | string;
  resource?: ResourcePolymorphicOrEntity | string;
};
