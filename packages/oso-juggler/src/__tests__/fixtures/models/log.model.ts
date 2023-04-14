import {Entity, belongsTo, model, property} from '@loopback/repository';

import {Foo} from './foo.model';

@model()
export class Log extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id: string;

  // @property()
  // fooId: string;

  @property()
  data: string;

  @belongsTo(() => Foo)
  fooId: string;

  constructor(data?: Partial<Log>) {
    super(data);
  }
}

export interface LogRelations {
  // describe navigational properties here
  foo: Foo;
}

export type LogWithRelations = Log & LogRelations;
