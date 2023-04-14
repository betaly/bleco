import {Entity, belongsTo, hasMany, model, property} from '@loopback/repository';

import {Issue} from './issue.model';
import {Org} from './org.model';
import {RepoRole} from './repo-role.model';

@model()
export class Repo extends Entity {
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

  @belongsTo(() => Org)
  orgId: number;

  @hasMany(() => Issue)
  issues: Issue[];

  @hasMany(() => RepoRole)
  roles: RepoRole[];

  constructor(data?: Partial<Repo>) {
    super(data);
  }
}

export interface RepoRelations {
  org: Org;
}

export type RepoWithRelations = Repo & RepoRelations;
