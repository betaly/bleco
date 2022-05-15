import {mixinQuery, QueryEnhancedRepository} from '@bleco/query';
import {SoftDeleteEntity} from '../models';
import {DefaultTransactionalSoftCrudRepository} from './default-transactional-soft-crud.repository';

@mixinQuery()
export class QueryEnhancedTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends DefaultTransactionalSoftCrudRepository<T, ID, Relations> {}

export interface QueryEnhancedTransactionalSoftCrudRepository<
  T extends SoftDeleteEntity,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ID,
  Relations extends object = {},
> extends QueryEnhancedRepository<T, Relations> {}
