import {Entity, Where} from '@loopback/repository';

export interface AuthorizedFilter<T extends Entity = Entity> {
  model: string;
  where: Where<T>;
}
