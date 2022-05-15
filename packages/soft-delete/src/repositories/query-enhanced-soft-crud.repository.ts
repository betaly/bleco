import {mixinQuery, QueryEnhancedRepository} from '@bleco/query';
import {SoftCrudRepository} from './soft-crud.repository';
import {SoftDeleteEntity} from '../models';

@mixinQuery()
export class QueryEnhancedSoftCrudRepository<
  T extends SoftDeleteEntity,
  ID,
  Relations extends object = {},
> extends SoftCrudRepository<T, ID, Relations> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface QueryEnhancedSoftCrudRepository<T extends SoftDeleteEntity, ID, Relations extends object = {}>
  extends QueryEnhancedRepository<T, Relations> {}
