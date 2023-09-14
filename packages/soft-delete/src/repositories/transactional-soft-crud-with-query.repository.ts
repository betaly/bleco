import {mixin} from '@bleco/mixin';
import {Getter} from '@loopback/core';
import {Entity, juggler} from '@loopback/repository';
import {AnyObj} from 'tily/typings/types';

import {SoftCrudRepositoryMixin} from '../mixins';
import {SoftDeleteEntity} from '../models';
import {TransactionalCrudRepositoryWithQuery} from 'loopback4-query';

@mixin(SoftCrudRepositoryMixin)
export class TransactionalSoftCrudWithQueryRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends TransactionalCrudRepositoryWithQuery<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: juggler.DataSource,
    public getCurrentUser?: Getter<AnyObj | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// @ts-ignore
export interface TransactionalSoftCrudWithQueryRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends TransactionalCrudRepositoryWithQuery<T, ID, Relations> {}
