/* eslint-disable @typescript-eslint/no-explicit-any */
import {isFunction} from 'tily/is/function';
import {Constructor, EntityCrudRepository} from '@loopback/repository';
import {resolveKnexClientWithDataSource} from '../knex';
import {ObjectQuery} from '../queries';
import {originalProp} from '../utils';

export type PatchResult = boolean | null;

export const ObjectQueryFns = ['find', 'findOne', 'count'];

export function patchObjectQueryToRepositoryClass(repoClass: Constructor<EntityCrudRepository<any, unknown>>) {
  return patchObjectQuery(repoClass.prototype);
}

export function patchObjectQueryToRepository(repo: EntityCrudRepository<any, unknown>) {
  return patchObjectQuery(repo);
}

export function unpatchObjectQueryFromRepositoryClass(repoClass: Constructor<EntityCrudRepository<any, unknown>>) {
  return unpatchObjectQuery(repoClass.prototype);
}

export function unpatchObjectQueryFromRepository(repo: EntityCrudRepository<any, unknown>) {
  return unpatchObjectQuery(repo);
}

function unpatchObjectQuery(target: any) {
  if (target.__getObjectQuery__) {
    delete target.__getObjectQuery__;
  }
  if (target.__objectQuery__) {
    delete target.__objectQuery__;
  }
  for (const method of ObjectQueryFns) {
    if (target[originalProp(method)]) {
      target[method] = target[originalProp(method)];
      delete target[originalProp(method)];
    }
  }
}

function patchObjectQuery(target: any): PatchResult {
  if (!target || !isFunction(target.find) || !isFunction(target.count)) {
    return false;
  }

  if (!target.__getObjectQuery__) {
    target.__getObjectQuery__ = function () {
      if (!this.__objectQuery__) {
        const ds = (this as any).dataSource;
        if (ds && resolveKnexClientWithDataSource(ds)) {
          this.__objectQuery__ = new ObjectQuery(this as any);
        }
      }
      return this.__objectQuery__;
    };

    for (const method of ObjectQueryFns) {
      if (target[method] && !target[originalProp(method)]) {
        target[originalProp(method)] = target[method];
        target[method] = function (...args: any[]) {
          const query = this.__getObjectQuery__();
          if (query) {
            return query[method](...args);
          }
          return this[originalProp(method)](...args);
        };
      }
    }
    return true;
  }

  return null;
}
