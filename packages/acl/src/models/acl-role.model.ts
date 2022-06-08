import {Entity, hasMany, model, property} from '@loopback/repository';
import {AclRolePermission} from '../models';
import {DomainAware, ObjectProps, ResourceAware, ResourcePolymorphicOrEntity} from '../types';
import {AclRoleMapping} from './acl-role-mapping.model';

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

  @hasMany(() => AclRolePermission, {keyTo: 'roleId'})
  permissions?: AclRolePermission[];

  @hasMany(() => AclRoleMapping, {keyTo: 'roleId'})
  principals?: AclRoleMapping[];
}

export interface AclRoleRelations {}

export type AclRoleWithRelations = AclRole & AclRoleRelations;

export type AclRoleProps = ObjectProps<Omit<AclRole, 'permissions' | 'principals' | 'resource'>>;
export type AclRoleAttrs = AclRoleProps & {
  resource?: ResourcePolymorphicOrEntity;
  actions?: string[];
};
