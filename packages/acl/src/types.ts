import {AnyObject, DataObject, Entity, Filter} from '@loopback/repository';
import {QueryWhere} from '@bleco/query';

export const AclDataSourceName = 'AclDB';

export const DefaultDomainId = '';

/**
 * Objects with open properties
 */
export interface AnyRecord {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [property: string]: any;
}

export interface ResourceFilter<T extends Entity = Entity> {
  model: string;
  where: QueryWhere<T>;
}

export type ResourcedWhere<T extends object = AnyObject> = DataObject<T> & { resource: Entity, domainId?: string };

export type ResourcedFilter<T extends object = AnyObject> = Omit<Filter<T>, 'where'> & { where: ResourcedWhere };
