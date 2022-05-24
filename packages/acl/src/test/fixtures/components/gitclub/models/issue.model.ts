import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Repo} from './repo.model';
import {User} from './user.model';

@model()
export class Issue extends Entity {
  @property({
    type: 'number',
    id: true,
    defaultFn: 'nanoid',
  })
  id: string;

  @property({
    type: 'string',
  })
  title?: string;

  @belongsTo(() => Repo)
  repoId: string;
}

export interface IssueRelations {
  repo: Repo;
  creator: User;
}

export type IssueWithRelations = Issue & IssueRelations;
