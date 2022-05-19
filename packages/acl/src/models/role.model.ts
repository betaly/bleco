import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {RoleMapping} from './role-mapping.model';
import {DomainAware, ObjectProps, ResourceAware, ResourcePolymorphicOrEntity} from '../types';
import {RolePermission} from '../models';

@model()
export class Role extends Entity implements DomainAware, ResourceAware {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id: string;

  @property({
    index: true,
  })
  name: string;

  @property({
    index: true,
  })
  domain: string;

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

  @hasMany(() => RolePermission, {keyTo: 'roleId'})
  permissions?: RolePermission[];

  @hasMany(() => RoleMapping, {keyTo: 'roleId'})
  principals?: RoleMapping[];
}

export interface RoleRelations {
  resource?: Entity;
}

export type RoleWithRelations = Role & RoleRelations;

export type RoleProps = ObjectProps<Omit<Role, 'permissions' | 'principals'>>;
export type RoleAttrs = RoleProps & {
  resource?: ResourcePolymorphicOrEntity;
  permissions?: string[];
};
