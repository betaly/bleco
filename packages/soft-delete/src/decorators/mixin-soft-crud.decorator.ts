import {MixinTarget} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {SoftCrudRepositoryMixin} from '../mixins';

/**
 * A decorator to mixin Query to a EntityCrudRepository
 */
export function mixinSoftCrud() {
  return function <T extends MixinTarget<DefaultCrudRepository<any, any>>>(superClass: T) {
    return SoftCrudRepositoryMixin(superClass);
  };
}
