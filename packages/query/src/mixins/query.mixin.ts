/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import {Entity, EntityCrudRepository} from '@loopback/repository';
import {MixinTarget} from '@loopback/core';
import {QueryFilter, QueryWhere} from '../filter';
import {DefaultQuery, Query} from '../query';

const debug = require('debug')('bleco:query:query-mixin');

export interface QueryRepository<M extends Entity, Relations extends object = {}> {
  readonly query?: Query<M, Relations> | null;
}

export interface QueryMixinOptions {
  overrideCruds?: boolean;
}

/**
 * A mixin to add query support to a repository.
 *
 * @param superClass - Base class
 * @param mixinOptions - Mixin options
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
    // null for unsupported data sources
    __query__?: Query<M, Relations> | null;

    get query() {
      if (this.__query__ === undefined && (this as any).dataSource) {
        try {
          this.__query__ = new DefaultQuery<M, Relations>(this);
        } catch (e) {
          this.__query__ = null;
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
      return super.findOne(filter, options);
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
