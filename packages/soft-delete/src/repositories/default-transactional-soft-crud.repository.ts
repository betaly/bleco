import {DefaultTransactionalRepository, Getter, juggler} from '@loopback/repository';
import {SoftDeleteEntity} from '../models';
import {UserLike} from '../types';
import {EntityClass} from '@bleco/query';
import {SoftCrudRepository, SoftCrudRepositoryMixin} from '../mixins';
import {mixin} from '@bleco/mixin';

@mixin(SoftCrudRepositoryMixin)
export class DefaultTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends DefaultTransactionalRepository<T, ID, Relations> {
  constructor(
    entityClass: EntityClass<T>,
    dataSource: juggler.DataSource,
    readonly getCurrentUser?: Getter<UserLike | undefined>,
  ) {
    super(entityClass, dataSource);
  }
}

// @ts-ignore
export interface DefaultTransactionalSoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends SoftCrudRepository<T, ID, Relations> {}
