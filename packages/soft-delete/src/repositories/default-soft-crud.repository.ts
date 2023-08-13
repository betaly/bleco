import {mixin} from '@bleco/mixin';
import {Getter} from '@loopback/core';
import {DefaultCrudRepository, Entity, juggler} from '@loopback/repository';
import {AnyObj} from 'tily/typings/types';

import {SoftCrudRepository, SoftCrudRepositoryMixin} from '../mixins';
import {SoftDeleteEntity} from '../models';

@mixin(SoftCrudRepositoryMixin)
export class DefaultSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends DefaultCrudRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: juggler.DataSource,
    public getCurrentUser?: Getter<AnyObj | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// @ts-ignore
export interface DefaultSoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends SoftCrudRepository<T, ID, Relations> {}
