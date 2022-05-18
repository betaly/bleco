import {Getter} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {SoftDeleteEntity} from '../models';
import {UserLike} from '../types';
import {mixinSoftCrud} from '../decorators';
import {EntityClass} from '@bleco/query';
import {SoftCrudRepository} from '../mixins';

@mixinSoftCrud()
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

// @ts-ignore
export interface DefaultSoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends SoftCrudRepository<T, ID, Relations> {}
