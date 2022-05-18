import {EntityClass, QueryEnhancedTransactionalRepository} from '@bleco/query';
import {SoftDeleteEntity} from '../models';
import {mixinSoftCrud} from '../decorators';
import {SoftCrudRepository} from '../mixins';
import {juggler} from '@loopback/repository';
import {Getter} from '@loopback/core';
import {UserLike} from '../types';

@mixinSoftCrud()
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

// @ts-ignore
export interface QueryEnhancedTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends SoftCrudRepository<T, ID, Relations> {}
