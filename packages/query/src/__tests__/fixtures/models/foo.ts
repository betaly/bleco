import {Entity, hasMany, model, property} from '@loopback/repository';
import {Bar} from './bar';

@model()
export class Foo extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property()
  name: string;

  @property()
  a?: number;

  @property()
  b?: number;

  @hasMany(() => Bar)
  bars: Bar[];

  constructor(data?: Partial<Foo>) {
    super(data);
  }
}
