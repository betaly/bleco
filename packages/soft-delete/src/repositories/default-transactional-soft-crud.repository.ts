import {mixin} from '@bleco/mixin';
import {DefaultTransactionalRepository, Entity, Getter, juggler} from '@loopback/repository';
import {AnyObj} from 'tily/typings/types';

import {SoftCrudRepository, SoftCrudRepositoryMixin} from '../mixins';
import {SoftDeleteEntity} from '../models';

@mixin(SoftCrudRepositoryMixin)
export class DefaultTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends DefaultTransactionalRepository<T, ID, Relations> {
  constructor(
    entityClass: typeof Entity & {prototype: T},
    dataSource: juggler.DataSource,
    public getCurrentUser?: Getter<AnyObj | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// @ts-ignore
export interface DefaultTransactionalSoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends SoftCrudRepository<T, ID, Relations> {}
