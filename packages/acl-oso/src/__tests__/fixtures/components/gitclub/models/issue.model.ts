import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Repo} from './repo.model';
import {User} from '../../common/models/user.model';

@model()
export class Issue extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  title?: string;

  @belongsTo(() => Repo)
  repoId: number;
}

export interface IssueRelations {
  repo: Repo;
  creator: User;
}

export type IssueWithRelations = Issue & IssueRelations;
