import {MixinTarget} from '@bleco/mixin';
import {Model, property} from '@loopback/repository';

export function UserUpdatableEntityMixin<T extends MixinTarget<Model>>(superClass: T) {
  class MixedModel extends superClass implements UserUpdatableModel {
    @property({
      type: 'string',
      name: 'created_by',
    })
    createdBy?: string;

    @property({
      type: 'string',
      name: 'updated_by',
    })
    updatedBy?: string;
  }

  return MixedModel;
}

export interface UserUpdatableModel {
  createdBy?: string;
  updatedBy?: string;
}
