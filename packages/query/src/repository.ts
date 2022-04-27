import {DefaultCrudRepository, Entity} from '@loopback/repository';
import {mixinSelectQuery} from './decorators';
import {SelectQueryRepository} from './mixins';

@mixinSelectQuery(true)
export class DefaultCrudRepositoryWithSelectQuery<
  T extends Entity,
  ID,
  Relations extends object = {},
> extends DefaultCrudRepository<T, ID, Relations> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DefaultCrudRepositoryWithSelectQuery<T extends Entity, ID, Relations extends object = {}>
  extends SelectQueryRepository<T, Relations> {}
