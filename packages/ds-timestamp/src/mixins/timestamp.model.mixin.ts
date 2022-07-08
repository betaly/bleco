import {MixinTarget} from '@bleco/mixin';
import {Model, property} from '@loopback/repository';

export function TimestampModelMixin<T extends MixinTarget<Model>>(superClass: T) {
  class MixedModel extends superClass implements TimestampModel {
    @property({
      type: 'date',
      default: () => new Date(),
      name: 'created_at',
      mysql: {
        columnName: 'created_at',
      },
    })
    createdAt?: Date;

    @property({
      type: 'date',
      default: () => new Date(),
      name: 'updated_at',
      mysql: {
        columnName: 'updated_at',
      },
    })
    updatedAt?: Date;
  }

  return MixedModel;
}

export interface TimestampModel {
  createdAt?: Date;
  updatedAt?: Date;
}
