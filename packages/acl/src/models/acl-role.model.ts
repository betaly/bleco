import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {AclRolePermission} from '../models';
import {DomainAware, ObjectProps, ResourceAware, ResourcePolymorphicOrEntity} from '../types';
import {AclRoleMapping} from './acl-role-mapping.model';
import {AclResource} from './models';

@model()
export class AclRole extends Entity implements DomainAware, ResourceAware {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'nanoid',
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

  @hasMany(() => AclRolePermission, {keyTo: 'roleId'})
  permissions?: AclRolePermission[];

  @hasMany(() => AclRoleMapping, {keyTo: 'roleId'})
  principals?: AclRoleMapping[];
}

export interface AclRoleRelations {
  resource?: Entity;
}

export type AclRoleWithRelations = AclRole & AclRoleRelations;

export type AclRoleProps = ObjectProps<Omit<AclRole, 'permissions' | 'principals'>>;
export type AclRoleAttrs = AclRoleProps & {
  resource?: ResourcePolymorphicOrEntity;
  actions?: string[];
};
