import {Entity, model, property} from '@loopback/repository';

@model()
export class Product extends Entity {
  @property({
    type: 'number',
    id: true,
    description: 'The unique identifier for a product',
  })
  id: number;

  @property({type: 'string'})
  name: string;

  @property({type: 'string'})
  slug: string;

  @property({
    type: 'date',
  })
  createdAt: Date;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
