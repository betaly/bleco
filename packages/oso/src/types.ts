import {Entity} from '@loopback/repository';
import {QueryWhere} from '@bleco/query';

export const OsoDataSourceName = 'OsoDB';

export interface ResourceFilter<T extends Entity = Entity> {
  model: string;
  where: QueryWhere<T>;
}
