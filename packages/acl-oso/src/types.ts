import {Entity} from '@loopback/repository';
import {QueryWhere} from '@bleco/query';

export const OsoDataSourceName = 'OsoDB';

export interface ResourceFilter<T extends Entity = Entity> {
  model: string;
  where: QueryWhere<T>;
}

export interface DomainSecurity {
  name: string;
  permissions?: string[];
  roles?: string[];
  rolePermissions?: Record<string, string[]>;
  roleInherits?: Record<string, string[]>;
  relations?: Record<string, {model: string; property?: string} | string>;
}

export type PolarActor = DomainSecurity;
export type PolarResource = DomainSecurity;

export type PolarActorContent = Omit<DomainSecurity, 'name'>;
export type PolarResourceContent = Omit<DomainSecurity, 'name'>;

export interface OsoPolicy {
  actors?: Record<string, PolarActorContent>;
  resources?: Record<string, PolarResourceContent>;
  rules?: string | string[];
}
