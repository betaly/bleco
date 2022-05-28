import {Entity, model, property} from '@loopback/repository';

@model()
export class Site extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  id: string;

  constructor(data?: Partial<Site>) {
    super(data);
  }
}

export const DefaultSite = new Site({id: 'default'});
