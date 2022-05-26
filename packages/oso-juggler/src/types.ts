import {Entity, EntityCrudRepository} from '@loopback/repository';
import {QueryWhere} from '@bleco/query';

export interface ResourceFilter<T extends Entity = Entity> {
  model: string;
  where: QueryWhere<T>;
}

export type RepositoryFactory<T extends Entity = Entity> = (
  modelName: string,
) => Promise<EntityCrudRepository<T, unknown>>;
