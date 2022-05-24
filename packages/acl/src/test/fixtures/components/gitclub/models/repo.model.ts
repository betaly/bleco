import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Org} from './org.model';
import {Issue} from './issue.model';

@model()
export class Repo extends Entity {
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

  @belongsTo(() => Org)
  orgId: string;

  @hasMany(() => Issue)
  issues: Issue[];

  constructor(data?: Partial<Repo>) {
    super(data);
  }
}

export interface RepoRelations {
  org: Org;
}

export type RepoWithRelations = Repo & RepoRelations;
