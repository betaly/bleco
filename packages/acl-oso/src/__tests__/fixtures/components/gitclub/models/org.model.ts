import {Entity, hasMany, model, property} from '@loopback/repository';
import {Repo} from './repo.model';

@model()
export class Org extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  base_repo_role: string;

  @property({
    type: 'string',
    name: 'billing_address',
  })
  billing_address: string;

  @hasMany(() => Repo)
  repositories: Repo[];

  constructor(data?: Partial<Org>) {
    super(data);
  }
}
