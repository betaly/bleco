import {Entity, model, property} from '@loopback/repository';

@model()
export class Num extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property()
  fooId: string;

  @property()
  number: number;

  constructor(data?: Partial<Num>) {
    super(data);
  }
}
