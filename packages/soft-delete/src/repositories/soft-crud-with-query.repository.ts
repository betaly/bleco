import {mixin} from '@bleco/mixin';
import {Getter} from '@loopback/core';
import {Entity, juggler} from '@loopback/repository';
import {CrudRepositoryWithQuery} from 'loopback4-query';
import {AnyObj} from 'tily/typings/types';

import {SoftCrudRepositoryMixin} from '../mixins';
import {SoftDeleteEntity} from '../models';

@mixin(SoftCrudRepositoryMixin)
export class SoftCrudWithQueryRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends CrudRepositoryWithQuery<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: juggler.DataSource,
    public getCurrentUser?: Getter<AnyObj | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// @ts-ignore
export interface SoftCrudWithQueryRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends CrudRepositoryWithQuery<T, ID, Relations> {}
