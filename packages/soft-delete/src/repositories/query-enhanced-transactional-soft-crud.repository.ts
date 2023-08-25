import {mixin} from '@bleco/mixin';
import {QueryEnhancedTransactionalRepository} from 'loopback4-query';
import {Getter} from '@loopback/core';
import {Entity, juggler} from '@loopback/repository';
import {AnyObj} from 'tily/typings/types';

import {SoftCrudRepository, SoftCrudRepositoryMixin} from '../mixins';
import {SoftDeleteEntity} from '../models';

@mixin(SoftCrudRepositoryMixin)
export class QueryEnhancedTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends QueryEnhancedTransactionalRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: juggler.DataSource,
    public getCurrentUser?: Getter<AnyObj | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// @ts-ignore
export interface QueryEnhancedTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends SoftCrudRepository<T, ID, Relations> {}
