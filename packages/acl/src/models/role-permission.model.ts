import {belongsTo, Entity, model, property} from '@loopback/repository';
import {AclRole} from './role.model';

@model()
export class AclRolePermission extends Entity {
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
    () => AclRole,
    {},
    {
      name: 'role_id',
    },
  )
  roleId: string;

  @property()
  permission: string;

  constructor(data?: Partial<AclRolePermission>) {
    super(data);
  }
}

export interface AclRolePermissionRelations {
  role?: AclRole;
}

export type AclRolePermissionWithRelations = AclRolePermission & AclRolePermissionRelations;
