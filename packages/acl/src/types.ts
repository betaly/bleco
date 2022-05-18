import {AnyObject, Entity, Filter, Options, ShortHandEqualType, Transaction} from '@loopback/repository';
import {KeyOf} from '@loopback/filter/src/query';
import {MarkRequired} from 'ts-essentials';

export const AclDataSourceName = 'AclDB';

export const DefaultDomainId = '$global';

/**
 * Objects with open properties
 */
export interface AnyRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [property: string]: any;
}

export type DeleteResult<D extends Record<string, number> = Record<string, number>> = {
  count: number;
  details?: D;
};

export type RoleType = 'builtin' | 'custom';

export type EntityLike = Entity | {id: string | number};
export type DomainLike = EntityLike;

export type ObjectProps<MT extends object> = {
  [P in KeyOf<MT>]?: MT[P];
};

export type ObjectCondition<MT extends object> = {
  [P in KeyOf<MT>]?: MT[P] & ShortHandEqualType;
};

export type DomainizedCondition<MT extends object> = MarkRequired<ObjectCondition<MT & DomainAware>, 'domainId'>;

export interface DomainAware {
  domainId: string;
}

export interface ActorAware {
  actorId?: string;
}

export interface RoleAware {
  roleId?: string;
}

export interface ResourceAware {
  resourceId?: string;
  resourceType?: string;
}

export type ResourcePolymorphic = Required<ResourceAware>;

export type ResourceRepresent = Entity | ResourcePolymorphic;

export interface OptionsWithTransaction extends Options {
  transaction?: Transaction;
}

export interface OptionsWithDomain extends OptionsWithTransaction {
  domain?: DomainLike | string;
}

export type FilterWithCustomWhere<T extends Entity, W extends object = AnyObject> = Omit<Filter<T>, 'where'> & {
  where: W;
};

export interface DomainRestriction {
  domainId: string;
}

export interface ResourceRestriction extends DomainRestriction, ResourcePolymorphic {}
