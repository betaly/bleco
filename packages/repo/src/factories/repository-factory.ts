import {Entity, EntityCrudRepository} from '@loopback/repository';
import {EntityClass} from '../types';

export interface RepositoryFactory {
  getRepository<T extends Entity, R extends object = {}>(
    entityClass: string | EntityClass<T>,
  ): Promise<EntityCrudRepository<T, unknown, R>>;
}
