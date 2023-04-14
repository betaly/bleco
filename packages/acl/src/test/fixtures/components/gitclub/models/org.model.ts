import {Entity, belongsTo, hasMany, model, property} from '@loopback/repository';

import {Global} from './global.model';
import {Repo} from './repo.model';

@model()
export class Org extends Entity {
  @property({
    type: 'string',
    id: true,
    defaultFn: 'nanoid',
  })
  id: string;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  base_repo_role?: string;

  @property({
    type: 'string',
    name: 'billing_address',
  })
  billing_address?: string;

  @belongsTo(() => Global)
  globalId: string;

  @hasMany(() => Repo)
  repositories: Repo[];

  constructor(data?: Partial<Org>) {
    super(data);
  }
}
