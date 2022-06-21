import {mixin} from '@bleco/mixin';
import {QueryEnhancedCrudRepository} from '@bleco/query';
import {Getter} from '@loopback/core';
import {Entity, juggler} from '@loopback/repository';
import {AnyObj} from 'tily/typings/types';
import {SoftCrudRepository, SoftCrudRepositoryMixin} from '../mixins';
import {SoftDeleteEntity} from '../models';

@mixin(SoftCrudRepositoryMixin)
export class QueryEnhancedSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends QueryEnhancedCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: juggler.DataSource,
    readonly getCurrentUser?: Getter<AnyObj | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface QueryEnhancedSoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends SoftCrudRepository<T, ID, Relations> {}
