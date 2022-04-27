import {DefaultCrudRepository, Entity} from '@loopback/repository';
import {mixinObjectQuery} from './decorators';
import {ObjectQueryRepository} from './mixins';

@mixinObjectQuery(true)
export class DefaultCrudRepositoryWithObjectQuery<
  T extends Entity,
  ID,
  Relations extends object = {},
> extends DefaultCrudRepository<T, ID, Relations> {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface DefaultCrudRepositoryWithObjectQuery<T extends Entity, ID, Relations extends object = {}>
  extends ObjectQueryRepository<T, Relations> {}
