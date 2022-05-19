import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Role} from './role.model';
import {DomainAware} from '../types';

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

  @property({
    index: true,
  })
  permission: string;

  constructor(data?: Partial<RolePermission>) {
    super(data);
  }
}

export interface RolePermissionRelations {
  role?: Role;
}

export type RolePermissionWithRelations = RolePermission & RolePermissionRelations;
