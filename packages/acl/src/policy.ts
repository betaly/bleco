import {Entity, EntityCrudRepository} from '@loopback/repository';
import {Class} from 'tily/typings/types';
import {AnyRecord} from './types';

export type PolicyModelType = 'actor' | 'resource';

export type PolicyModel<T extends Entity = Entity> = typeof Entity & {prototype: T};

export interface Policy {
  type: PolicyModelType;
  model: PolicyModel;
  repository?: Class<EntityCrudRepository<Entity, unknown>>;
  permissions?: string[];
  roles?: string[];
  rolePermissions?: Record<string, string[]>;
  roleInherits?: Record<string, string[]>;
  relations?: Record<string, {model: string; property?: string} | string>;
  rules?: AnyRecord;
}

export interface ActorPolicy extends Policy {
  type: 'actor';
}

export interface ResourcePolicy extends Policy {
  type: 'resource';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPolicy(x: any): x is Policy {
  return x?.type !== undefined && x.model !== undefined;
}
