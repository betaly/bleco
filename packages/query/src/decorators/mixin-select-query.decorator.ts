/* eslint-disable @typescript-eslint/no-explicit-any */
import {MixinTarget} from '@loopback/core';
import {EntityCrudRepository} from '@loopback/repository';
import {SelectQueryMixinOptions, SelectQueryRepositoryMixin} from '../mixins';

/**
 * A decorator to mixin SelectQuery to a EntityCrudRepository
 */
export function mixinSelectQuery(mixinOptions: boolean | SelectQueryMixinOptions = false) {
  return function <T extends MixinTarget<EntityCrudRepository<any, any>>>(superClass: T) {
    return SelectQueryRepositoryMixin(superClass, mixinOptions);
  };
}
