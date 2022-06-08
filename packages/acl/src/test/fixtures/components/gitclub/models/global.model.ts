import {Entity, model, property} from '@loopback/repository';

@model()
export class Global extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  constructor(data?: Partial<Global>) {
    super(data);
  }
}

export const GLOBAL = new Global({id: 'global'});
