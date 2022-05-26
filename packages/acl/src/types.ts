import {Entity, Filter, Options, Transaction} from '@loopback/repository';
import {KeyOf} from '@loopback/filter/src/query';
import {OmitProperties} from 'ts-essentials';
import {AnyObject} from '@loopback/filter/src/types';

export const AclAuthDBName = 'AclAuthDB';
export const AclResourceDBName = 'AclResourceDB';

export const DefaultDomain = '';

export type QueryWhereExcludingWhere<T extends object = AnyObject> = Omit<Filter<T>, 'where'>;

export type DeleteResult<D extends Record<string, number> = Record<string, number>> = {
  count: number;
  details?: D;
};

export type EntityLike = Entity | {id: string | number};
export type DomainLike = EntityLike;

export type ObjectProps<MT extends object, MP extends object = OmitProperties<MT, Function>> = {
  [P in KeyOf<MP>]?: MP[P];
};

export interface DomainAware {
  domain: string;
}

export interface PrincipalAware {
  principalType?: string;
  principalId?: string;
}

export interface RoleAware {
  roleId?: string;
}

export interface ResourceAware {
  resourceId?: string;
  resourceType?: string;
}

export type PrincipalPolymorphic = Required<PrincipalAware>;

export type PrincipalPolymorphicOrEntity = Entity | PrincipalPolymorphic;

export type ResourcePolymorphic = Required<ResourceAware>;

export type ResourcePolymorphicOrEntity = Entity | ResourcePolymorphic;

export interface OptionsWithTransaction extends Options {
  transaction?: Transaction;
}

export interface OptionsWithDomain extends OptionsWithTransaction {
  domain?: DomainLike | string;
}
