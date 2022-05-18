import {AndClause, Condition, DataObject, DefaultCrudRepository, Filter, OrClause, Where} from '@loopback/repository';
import {Getter, MixinTarget} from '@loopback/core';
import {Count} from '@loopback/repository/src/common-types';
import {Options} from 'loopback-datasource-juggler';
import {HttpErrors} from '@loopback/rest';
import {UserLike} from '../types';
import {ErrorKeys} from '../error-keys';
import {SoftDeleteEntity} from '../models';
import {getUserId} from '../helpers';

export function SoftCrudRepositoryMixin<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object,
  R extends MixinTarget<DefaultCrudRepository<T, ID, Relations>>,
>(superClass: R) {
  return class extends superClass implements Partial<SoftCrudRepository<T, ID, Relations>> {
    getCurrentUser?: Getter<UserLike | undefined>;

    find = (filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> => {
      // Filter out soft deleted entries
      if (filter?.where && (filter.where as AndClause<T>).and && (filter.where as AndClause<T>).and.length > 0) {
        (filter.where as AndClause<T>).and.push({
          deleted: false,
        } as Condition<T>);
      } else if (filter?.where && (filter.where as OrClause<T>).or && (filter.where as OrClause<T>).or.length > 0) {
        filter.where = {
          and: [
            {
              deleted: false,
            } as Condition<T>,
            {
              or: (filter.where as OrClause<T>).or,
            },
          ],
        };
      } else {
        filter = filter ?? {};
        filter.where = filter.where ?? {};
        (filter.where as Condition<T>).deleted = false;
      }

      // Now call super
      return super.find(filter, options);
    };

    //find all entities including soft deleted records
    findAll(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {
      return super.find(filter, options);
    }

    findOne = (filter?: Filter<T>, options?: Options): Promise<(T & Relations) | null> => {
      // Filter out soft deleted entries
      if (filter?.where && (filter.where as AndClause<T>).and && (filter.where as AndClause<T>).and.length > 0) {
        (filter.where as AndClause<T>).and.push({
          deleted: false,
        } as Condition<T>);
      } else if (filter?.where && (filter.where as OrClause<T>).or && (filter.where as OrClause<T>).or.length > 0) {
        filter.where = {
          and: [
            {
              deleted: false,
            } as Condition<T>,
            {
              or: (filter.where as OrClause<T>).or,
            },
          ],
        };
      } else {
        filter = filter ?? {};
        filter.where = filter.where ?? {};
        (filter.where as Condition<T>).deleted = false;
      }

      // Now call super
      return super.findOne(filter, options);
    };

    //findOne() including soft deleted entry
    findOneIncludeSoftDelete(filter?: Filter<T>, options?: Options): Promise<(T & Relations) | null> {
      return super.findOne(filter, options);
    }

    findById = async (id: ID, filter?: Filter<T>, options?: Options): Promise<T & Relations> => {
      // Filter out soft deleted entries
      if (filter?.where && (filter.where as AndClause<T>).and && (filter.where as AndClause<T>).and.length > 0) {
        (filter.where as AndClause<T>).and.push({
          deleted: false,
          id: id,
        } as Condition<T>);
      } else if (filter?.where && (filter.where as OrClause<T>).or && (filter.where as OrClause<T>).or.length > 0) {
        filter.where = {
          and: [
            {
              deleted: false,
              id: id,
            } as Condition<T>,
            {
              or: (filter.where as OrClause<T>).or,
            },
          ],
        };
      } else {
        filter = filter ?? {};
        filter.where = {
          deleted: false,
          id: id,
        } as Condition<T>;
      }

      //As parent method findById have filter: FilterExcludingWhere<T>
      //so we need add check here.
      const entityToRemove = await super.findOne(filter, options);

      if (entityToRemove) {
        // Now call super
        return super.findById(id, filter, options);
      } else {
        throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
      }
    };

    //find by `id` including soft deleted record
    async findByIdIncludeSoftDelete(id: ID, filter?: Filter<T>, options?: Options): Promise<T & Relations> {
      return super.findById(id, filter, options);
    }

    updateAll = (data: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count> => {
      // Filter out soft deleted entries
      if (where && (where as AndClause<T>).and && (where as AndClause<T>).and.length > 0) {
        (where as AndClause<T>).and.push({
          deleted: false,
        } as Condition<T>);
      } else if (where && (where as OrClause<T>).or && (where as OrClause<T>).or.length > 0) {
        where = {
          and: [
            {
              deleted: false,
            } as Condition<T>,
            {
              or: (where as OrClause<T>).or,
            },
          ],
        };
      } else {
        where = where ?? {};
        (where as Condition<T>).deleted = false;
      }

      // Now call super
      return super.updateAll(data, where, options);
    };

    count = (where?: Where<T>, options?: Options): Promise<Count> => {
      // Filter out soft deleted entries
      if (where && (where as AndClause<T>).and && (where as AndClause<T>).and.length > 0) {
        (where as AndClause<T>).and.push({
          deleted: false,
        } as Condition<T>);
      } else if (where && (where as OrClause<T>).or && (where as OrClause<T>).or.length > 0) {
        where = {
          and: [
            {
              deleted: false,
            } as Condition<T>,
            {
              or: (where as OrClause<T>).or,
            },
          ],
        };
      } else {
        where = where ?? {};
        (where as Condition<T>).deleted = false;
      }

      // Now call super
      return super.count(where, options);
    };

    delete = async (entity: T, options?: Options): Promise<void> => {
      // Do soft delete, no hard delete allowed
      (entity as SoftDeleteEntity).deleted = true;
      (entity as SoftDeleteEntity).deletedOn = new Date();
      (entity as SoftDeleteEntity).deletedBy = await this.getUserId();
      return super.update(entity, options);
    };

    deleteAll = async (where?: Where<T>, options?: Options): Promise<Count> => {
      // Do soft delete, no hard delete allowed
      return this.updateAll(
        {
          deleted: true,
          deletedOn: new Date(),
          deletedBy: await this.getUserId(),
        } as DataObject<T>,
        where,
        options,
      );
    };

    deleteById = async (id: ID, options?: Options): Promise<void> => {
      // Do soft delete, no hard delete allowed
      return super.updateById(
        id,
        {
          deleted: true,
          deletedOn: new Date(),
          deletedBy: await this.getUserId(),
        } as DataObject<T>,
        options,
      );
    };

    /**
     * Method to perform hard delete of entries. Take caution.
     * @param entity
     * @param options
     */
    deleteHard(entity: T, options?: Options): Promise<void> {
      // Do hard delete
      return super.deleteById(entity.getId(), options);
    }

    /**
     * Method to perform hard delete of entries. Take caution.
     * @param where
     * @param options
     */
    deleteAllHard(where?: Where<T>, options?: Options): Promise<Count> {
      // Do hard delete
      return super.deleteAll(where, options);
    }

    /**
     * Method to perform hard delete of entries. Take caution.
     * @param id
     * @param options
     */
    deleteByIdHard(id: ID, options?: Options): Promise<void> {
      // Do hard delete
      return super.deleteById(id, options);
    }

    async getUserId(options?: Options): Promise<string | undefined> {
      if (!this.getCurrentUser) {
        return undefined;
      }
      let currentUser = await this.getCurrentUser();
      currentUser = currentUser ?? options?.currentUser;
      return currentUser ? getUserId(currentUser) : undefined;
    }
  };
}

export interface SoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends DefaultCrudRepository<T, ID, Relations> {
  find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]>;

  findOne(filter?: Filter<T>, options?: Options): Promise<(T & Relations) | null>;

  findById(id: ID, filter?: Filter<T>, options?: Options): Promise<T & Relations>;

  updateAll(data: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count>;

  count(where?: Where<T>, options?: Options): Promise<Count>;

  delete(entity: T, options?: Options): Promise<void>;

  deleteAll(where?: Where<T>, options?: Options): Promise<Count>;

  deleteById(id: ID, options?: Options): Promise<void>;

  findAll(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]>;

  findOneIncludeSoftDelete(filter?: Filter<T>, options?: Options): Promise<(T & Relations) | null>;

  findByIdIncludeSoftDelete(id: ID, filter?: Filter<T>, options?: Options): Promise<T & Relations>;

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteHard(entity: T, options?: Options): Promise<void>;

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param where
   * @param options
   */
  deleteAllHard(where?: Where<T>, options?: Options): Promise<Count>;

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param id
   * @param options
   */
  deleteByIdHard(id: ID, options?: Options): Promise<void>;
}
