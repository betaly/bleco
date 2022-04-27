import {Entity, model, property} from '@loopback/repository';

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

  constructor(data?: Partial<Foo>) {
    super(data);
  }
}
