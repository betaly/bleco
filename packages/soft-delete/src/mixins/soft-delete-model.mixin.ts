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
      name: 'deleted_on',
      jsonSchema: {
        nullable: true,
      },
    })
    deletedOn?: Date;

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
  deletedOn?: Date;
  deletedBy?: string;
}