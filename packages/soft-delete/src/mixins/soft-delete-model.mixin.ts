import {MixinTarget} from '@loopback/core';
import {Entity, property} from '@loopback/repository';

export function SoftDeleteModelMixin<T extends MixinTarget<Entity>>(superClass: T) {
  class SoftDeleteEntityClass extends superClass {
    @property({
      type: 'boolean',
      default: false,
    })
    deleted?: boolean;

    @property({
      type: 'date',
      name: 'deleted_at',
      jsonSchema: {
        nullable: true,
      },
    })
    deletedAt?: Date;

    @property({
      type: 'string',
      name: 'deleted_by',
      jsonSchema: {
        nullable: true,
      },
    })
    deletedBy?: string;
  }

  return SoftDeleteEntityClass;
}

export interface SoftDeleteModel {
  deleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}
