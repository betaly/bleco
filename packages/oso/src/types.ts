import {Entity} from '@loopback/repository';
import {QueryWhere} from '@bleco/query';

export interface PolarResource {
  name: string;
  permissions: string[];
  roles: string[];
  rolePermissions?: Record<string, string[]>;
  roleInherits?: Record<string, string[]>;
  relations?: Record<string, string>;
}

export interface ResourceFilter<T extends Entity = Entity> {
  model: string;
  where: QueryWhere<T>;
}
