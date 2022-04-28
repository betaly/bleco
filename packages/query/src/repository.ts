import {DefaultCrudRepository, Entity} from '@loopback/repository';
import {mixinQuery} from './decorators';
import {QueryRepository} from './mixins';

@mixinQuery(true)
export class DefaultCrudRepositoryWithQuery<
  T extends Entity,
  ID,
  Relations extends object = {},
> extends DefaultCrudRepository<T, ID, Relations> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DefaultCrudRepositoryWithQuery<T extends Entity, ID, Relations extends object = {}>
  extends QueryRepository<T, Relations> {}
