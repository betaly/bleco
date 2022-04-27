/* eslint-disable @typescript-eslint/no-explicit-any */
import {MixinTarget} from '@loopback/core';
import {EntityCrudRepository} from '@loopback/repository';
import {ObjectQueryMixinOptions, ObjectQueryRepositoryMixin} from '../mixins';

/**
 * A decorator to mixin ObjectQuery to a EntityCrudRepository
 */
export function mixinObjectQuery(mixinOptions: boolean | ObjectQueryMixinOptions = false) {
  return function <T extends MixinTarget<EntityCrudRepository<any, any>>>(superClass: T) {
    return ObjectQueryRepositoryMixin(superClass, mixinOptions);
  };
}
