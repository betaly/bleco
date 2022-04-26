/* eslint-disable @typescript-eslint/no-explicit-any */
import {Entity, EntityCrudRepository} from '@loopback/repository';
import {MixinTarget} from '@loopback/core';
import {ObjectQuery} from '../queries';
import {resolveKnexClientWithDataSource} from '../knex';
import {QueryFilter, QueryWhere} from '../filter';

/*
 * This function adds a new method 'findByTitle' to a repository class
 * where 'M' is a model which extends Model
 *
 * @param superClass - Base class
 *
 * @typeParam M - Model class which extends Model
 * @typeParam R - Repository class
 */
export function ObjectQueryRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
>(superClass: R) {
  class MixedRepository extends superClass {
    _objectQuery?: ObjectQuery<M, ID, Relations>;

    get objectQuery() {
      if (!this._objectQuery) {
        const ds = (this as any).dataSource;
        if (ds && resolveKnexClientWithDataSource(ds)) {
          this._objectQuery = new ObjectQuery(this as any);
        }
      }
      return this._objectQuery;
    }

    count = async (where?: QueryWhere<M>, options?: object): Promise<{count: number}> => {
      const query = this.objectQuery;
      if (query) {
        return query.count(where, options);
      }
      return super.count(where, options);
    };

    find = async (filter?: QueryFilter<M>, options?: object): Promise<(M & Relations)[]> => {
      const objectQuery = this.objectQuery;
      if (objectQuery) {
        return objectQuery.find(filter, options);
      }
      return super.find(filter, options);
    };

    findOne = async (filter?: QueryFilter<M>, options?: object): Promise<(M & Relations) | null> => {
      const objectQuery = this.objectQuery;
      if (objectQuery) {
        return objectQuery.findOne(filter, options);
      }
      filter = filter ?? {};
      filter.limit = 1;
      const result = await super.find(filter, options);
      return result[0] ?? null;
    };
  }

  return MixedRepository;
}
