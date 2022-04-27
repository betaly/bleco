/* eslint-disable @typescript-eslint/no-explicit-any */
import {isFunction} from 'tily/is/function';
import {Constructor, EntityCrudRepository} from '@loopback/repository';
import {resolveKnexClientWithDataSource} from '../knex';
import {SelectQuery} from '../queries';
import {originalProp} from '../utils';

const debug = require('debug')('bleco:query:object-query-patch');

export type PatchResult = boolean | null;

export const SelectQueryFns = ['find', 'findOne', 'count'];

export function patchSelectQueryToRepositoryClass(repoClass: Constructor<EntityCrudRepository<any, unknown>>) {
  return patchSelectQuery(repoClass.prototype);
}

export function patchSelectQueryToRepository(repo: EntityCrudRepository<any, unknown>) {
  return patchSelectQuery(repo);
}

export function unpatchSelectQueryFromRepositoryClass(repoClass: Constructor<EntityCrudRepository<any, unknown>>) {
  return unpatchSelectQuery(repoClass.prototype);
}

export function unpatchSelectQueryFromRepository(repo: EntityCrudRepository<any, unknown>) {
  return unpatchSelectQuery(repo);
}

function unpatchSelectQuery(target: any) {
  if (target.__getSelectQuery__) {
    delete target.__getSelectQuery__;
  }
  if (target.__selectQuery__) {
    delete target.__selectQuery__;
  }
  for (const method of SelectQueryFns) {
    if (target[originalProp(method)]) {
      target[method] = target[originalProp(method)];
      delete target[originalProp(method)];
    }
  }
}

function patchSelectQuery(target: any): PatchResult {
  if (!target || !isFunction(target.find) || !isFunction(target.count)) {
    return false;
  }

  if (!target.__getSelectQuery__) {
    target.__getSelectQuery__ = function () {
      if (!this.__selectQuery__) {
        const ds = (this as any).dataSource;
        if (ds && resolveKnexClientWithDataSource(ds)) {
          this.__selectQuery__ = new SelectQuery(this as any);
        }
      }
      return this.__selectQuery__;
    };

    for (const method of SelectQueryFns) {
      if (target[method] && !target[originalProp(method)]) {
        target[originalProp(method)] = target[method];
        target[method] = function (...args: any[]) {
          const query = this.__getSelectQuery__();
          if (query) {
            debug(`${this.constructor.name} ${method}() -> selectQuery.${method}()`);
            return query[method](...args);
          }
          debug(`${this.constructor.name} ${method}() -> super.${method}()`);
          return this[originalProp(method)](...args);
        };
      }
    }
    return true;
  }

  return null;
}
