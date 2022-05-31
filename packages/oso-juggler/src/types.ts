import {QueryWhere} from '@bleco/query';
import {Entity} from '@loopback/repository';

export interface ResourceFilter<T extends Entity = Entity> {
  model: string;
  where: QueryWhere<T>;
}
