/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import {Entity, EntityCrudRepository} from '@loopback/repository';
import {MixinTarget} from '@loopback/core';
import {Query, SqlQuery} from '../queries';
import {resolveKnexClientWithDataSource} from '../knex';
import {QueryFilter, QueryWhere} from '../filter';

const debug = require('debug')('bleco:query:sql-query-mixin');

export interface QueryRepository<M extends Entity, Relations extends object = {}> {
  readonly query?: Query<M, Relations>;
}

export interface QueryMixinOptions {
  overrideCruds?: boolean;
}

/**
 * A mixin to add query support to a repository.
 *
 * @param superClass - Base class
 */
export function QueryRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
>(superClass: R, mixinOptions: boolean | QueryMixinOptions = {}) {
  const opts = typeof mixinOptions === 'boolean' ? {overrideCruds: mixinOptions} : mixinOptions;
  const {overrideCruds = true} = opts ?? {};

  return class extends superClass implements QueryRepository<M, Relations> {
    __query__?: SqlQuery<M, Relations>;

    get query() {
      if (!this.__query__) {
        const ds = (this as any).dataSource;
        if (ds) {
          if (resolveKnexClientWithDataSource(ds)) {
            this.__query__ = new SqlQuery(this as any);
          }
        }
      }
      return this.__query__;
    }

    find = async (filter?: QueryFilter<M>, options?: object): Promise<(M & Relations)[]> => {
      if (overrideCruds && this.query) {
        debug(`${this.constructor.name} find() -> query.find()`);
        return this.query.find(filter, options);
      }
      debug(`${this.constructor.name} find() -> super.find()`);
      return super.find(filter, options);
    };

    findOne = async (filter?: QueryFilter<M>, options?: object): Promise<(M & Relations) | null> => {
      if (overrideCruds && this.query) {
        debug(`${this.constructor.name} findOne() -> query.findOne()`);
        return this.query.findOne(filter, options);
      }
      // @ts-ignore
      if (!super.findOne) {
        throw new Error('findOne is not implemented in this repository');
      }
      debug(`${this.constructor.name} findOne() -> super.findOne()`);
      // @ts-ignore
      return super.findOne(...args);
    };

    count = async (where?: QueryWhere<M>, options?: object): Promise<{count: number}> => {
      if (overrideCruds && this.query) {
        debug(`${this.constructor.name} count() -> query.count()`);
        return this.query.count(where, options);
      }
      debug(`${this.constructor.name} count() -> super.count()`);
      return super.count(where, options);
    };
  };
}
