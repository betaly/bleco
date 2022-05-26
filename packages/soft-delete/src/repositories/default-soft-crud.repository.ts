import {Getter} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {SoftDeleteEntity} from '../models';
import {UserLike} from '../types';
import {EntityClass} from '@bleco/query';
import {SoftCrudRepository, SoftCrudRepositoryMixin} from '../mixins';
import {mixin} from '@bleco/mixin';

@mixin(SoftCrudRepositoryMixin)
export class DefaultSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends DefaultCrudRepository<T, ID, Relations> {
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
export interface DefaultSoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends SoftCrudRepository<T, ID, Relations> {}
