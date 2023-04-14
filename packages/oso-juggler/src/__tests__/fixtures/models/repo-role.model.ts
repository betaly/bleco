import {Entity, belongsTo, model, property} from '@loopback/repository';

import {Org} from './org.model';
import {Repo} from './repo.model';
import {User} from './user.model';

@model()
export class RepoRole extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property()
  name: string;

  @belongsTo(() => Repo)
  repoId: number;

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<RepoRole>) {
    super(data);
  }
}

export interface RepoRoleRelations {
  org: Org;
  user: User;
}

export type RepoRoleWithRelations = RepoRole & RepoRoleRelations;
