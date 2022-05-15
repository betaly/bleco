import {Entity, model, property} from '@loopback/repository';

@model()
export class Org extends Entity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'nanoid',
  })
  id?: string;

  @property()
  name: string;
}
