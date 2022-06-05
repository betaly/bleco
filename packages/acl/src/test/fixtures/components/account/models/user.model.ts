import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'nanoid',
  })
  id: string;

  @property()
  name: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
