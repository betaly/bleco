import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Bar} from './bar.model';
import {Log} from './log.model';
import {Num} from './num.model';

@model()
export class Foo extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  @property()
  isFooey: boolean;

  @belongsTo(() => Bar)
  barId: string;

  @hasMany(() => Log)
  logs: Log[];

  @hasMany(() => Num)
  numbers: Num[];

  constructor(data?: Partial<Foo>) {
    super(data);
  }
}

export interface FooRelations {
  // describe navigational properties here
  bar: Bar;
}

export type FooWithRelations = Foo & FooRelations;
