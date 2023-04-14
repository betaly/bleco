import {Entity, hasMany, model, property} from '@loopback/repository';

import {Foo} from './foo.model';

@model()
export class Bar extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id: string;

  @property()
  isCool: boolean;

  @property()
  isStillCool: boolean;

  @hasMany(() => Foo)
  foos: Foo[];

  constructor(data?: Partial<Bar>) {
    super(data);
  }
}

export interface BarRelations {
  // describe navigational properties here
}

export type BarWithRelations = Bar & BarRelations;
