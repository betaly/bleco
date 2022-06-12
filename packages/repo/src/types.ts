import {Entity} from '@loopback/repository';

export type EntityClass<T extends Entity = Entity> = typeof Entity & {prototype: T};
