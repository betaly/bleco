/* eslint-disable @typescript-eslint/ban-ts-comment */
import {MixinTarget} from '@bleco/mixin';
import {
  Count,
  DataObject,
  DefaultCrudRepository,
  Entity,
  FilterExcludingWhere,
  Options,
  Where,
} from '@loopback/repository';

import {TimestampModel} from './timestamp.model.mixin';

export interface TimestampRepositoryOperationOptions extends Options {
  skipUpdatedAt?: boolean;
}

export function TimestampRepositoryMixin<
  T extends Entity & TimestampModel,
  ID,
  Relations extends object,
  R extends MixinTarget<DefaultCrudRepository<T, ID, Relations>>,
>(superClass: R) {
  class MixedRepository extends superClass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }

    // @ts-ignore
    async save(entity: T, options?: TimestampRepositoryOperationOptions): Promise<T> {
      if (!options?.skipUpdatedAt) {
        entity.updatedAt = new Date();
      }
      return super.save(entity, options);
    }

    // @ts-ignore
    async update(entity: T, options?: TimestampRepositoryOperationOptions): Promise<void> {
      if (!options?.skipUpdatedAt) {
        entity.updatedAt = new Date();
      }
      return super.update(entity, options);
    }

    // @ts-ignore
    async updateAll(
      data: DataObject<T>,
      where?: Where<T>,
      options?: TimestampRepositoryOperationOptions,
    ): Promise<Count> {
      if (!options?.skipUpdatedAt) {
        data.updatedAt = new Date();
      }
      return super.updateAll(data, where, options);
    }

    // @ts-ignore
    async updateById(id: ID, data: DataObject<T>, options?: TimestampRepositoryOperationOptions): Promise<void> {
      if (!options?.skipUpdatedAt) {
        data.updatedAt = new Date();
      }
      return super.updateById(id, data, options);
    }

    // @ts-ignore
    async replaceById(id: ID, data: DataObject<T>, options?: TimestampRepositoryOperationOptions): Promise<void> {
      if (!options?.skipUpdatedAt) {
        data.updatedAt = new Date();
      }
      const model = await this.findById(id, {fields: ['id', 'createdAt']} as FilterExcludingWhere<T>, options);
      data.createdAt = model.createdAt;
      return super.replaceById(id, data, options);
    }
  }

  return MixedRepository;
}
