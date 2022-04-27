/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import {Entity, EntityCrudRepository} from '@loopback/repository';
import {MixinTarget} from '@loopback/core';
import {SelectQuery} from '../queries';
import {resolveKnexClientWithDataSource} from '../knex';
import {QueryFilter, QueryWhere} from '../filter';

const debug = require('debug')('bleco:query:object-query-mixin');

export interface SelectQueryRepository<M extends Entity, Relations extends object = {}> {
  readonly selectQuery?: SelectQuery<M, Relations>;

  /**
   * Find all entities that match the given filter with SelectQuery
   * @param filter The filter to apply
   * @param options Options for the query
   */
  select(filter?: QueryFilter<M>, options?: object): Promise<(M & Relations)[]>;

  /**
   * Find first entity that matches the given filter with SelectQuery
   * @param filter The filter to apply
   * @param options Options for the query
   */
  selectOne(filter?: QueryFilter<M>, options?: object): Promise<(M & Relations) | null>;

  /**
   * Count all entities that match the given filter with SelectQuery
   * @param where The where to apply
   * @param options Options for the query
   */
  selectCount(where?: QueryWhere<M>, options?: object): Promise<{count: number}>;
}

export interface SelectQueryMixinOptions {
  overrideCruds?: boolean;
}
/*
 * This function adds a new method 'findByTitle' to a repository class
 * where 'M' is a model which extends Model
 *
 * @param superClass - Base class
 */
export function SelectQueryRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
>(superClass: R, mixinOptions: boolean | SelectQueryMixinOptions = {}) {
  const opts = typeof mixinOptions === 'boolean' ? {overrideCruds: mixinOptions} : mixinOptions;
  const {overrideCruds = true} = opts ?? {};

  return class extends superClass implements SelectQueryRepository<M, Relations> {
    _selectQuery?: SelectQuery<M, Relations>;

    get selectQuery() {
      if (!this._selectQuery) {
        const ds = (this as any).dataSource;
        if (ds && resolveKnexClientWithDataSource(ds)) {
          this._selectQuery = new SelectQuery(this as any);
        }
      }
      return this._selectQuery;
    }

    select = async (filter?: QueryFilter<M>, options?: object): Promise<(M & Relations)[]> => {
      const selectQuery = this.selectQuery;
      if (selectQuery) {
        return selectQuery.find(filter, options);
      }
      return super.find(filter, options);
    };

    find = async (...args: any[]): Promise<any> => (overrideCruds ? this.select(...args) : super.find(...args));

    selectOne = async (filter?: QueryFilter<M>, options?: object): Promise<(M & Relations) | null> => {
      const selectQuery = this.selectQuery;
      if (selectQuery) {
        debug(`${this.constructor.name} selectOne() -> selectQuery.findOne()`);
        return selectQuery.findOne(filter, options);
      }
      // @ts-ignore
      if (!super.findOne) {
        throw new Error('findOne is not implemented in this repository');
      }
      debug(`${this.constructor.name} findOne() -> super.findOne()`);
      // @ts-ignore
      return super.findOne(...args);
    };

    findOne = async (...args: any[]): Promise<any> => {
      if (overrideCruds) {
        return this.selectOne(...args);
      }
      // @ts-ignore
      if (!super.findOne) {
        throw new Error('findOne is not implemented in this repository');
      }
      debug(`${this.constructor.name} findOne() -> super.findOne()`);
      // @ts-ignore
      return super.findOne(...args);
    };

    selectCount = async (where?: QueryWhere<M>, options?: object): Promise<{count: number}> => {
      const query = this.selectQuery;
      if (query) {
        debug(`${this.constructor.name} selectCount() -> selectQuery.count()`);
        return query.count(where, options);
      }
      debug(`${this.constructor.name} selectCount() -> super.count()`);
      return super.count(where, options);
    };

    count = async (...args: any[]): Promise<any> => (overrideCruds ? this.selectCount(...args) : super.count(...args));
  };
}
