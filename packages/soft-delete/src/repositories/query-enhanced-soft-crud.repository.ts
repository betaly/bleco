import {EntityClass, QueryEnhancedCrudRepository} from '@bleco/query';
import {SoftDeleteEntity} from '../models';
import {SoftCrudRepository, SoftCrudRepositoryMixin} from '../mixins';
import {juggler} from '@loopback/repository';
import {Getter} from '@loopback/core';
import {UserLike} from '../types';
import {mixin} from '@bleco/mixin';

@mixin(SoftCrudRepositoryMixin)
export class QueryEnhancedSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends QueryEnhancedCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: EntityClass<T>,
    dataSource: juggler.DataSource,
    readonly getCurrentUser?: Getter<UserLike | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// @ts-ignore
export interface QueryEnhancedSoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends SoftCrudRepository<T, ID, Relations> {}