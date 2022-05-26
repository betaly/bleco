import {EntityClass, QueryEnhancedTransactionalRepository} from '@bleco/query';
import {juggler} from '@loopback/repository';
import {Getter} from '@loopback/core';
import {mixin} from '@bleco/mixin';
import {UserLike} from '../types';
import {SoftDeleteEntity} from '../models';
import {SoftCrudRepository, SoftCrudRepositoryMixin} from '../mixins';

@mixin(SoftCrudRepositoryMixin)
export class QueryEnhancedTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends QueryEnhancedTransactionalRepository<T, ID, Relations> {
  constructor(
    entityClass: EntityClass<T>,
    dataSource: juggler.DataSource,
    readonly getCurrentUser?: Getter<UserLike | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface QueryEnhancedTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends SoftCrudRepository<T, ID, Relations> {}
