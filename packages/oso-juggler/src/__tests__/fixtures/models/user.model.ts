import {Entity, hasMany, model, property} from '@loopback/repository';

import {OrgRole} from './org-role.model';
import {RepoRole} from './repo-role.model';

@model()
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  email?: string;

  @hasMany(() => RepoRole)
  repoRoles: RepoRole[];

  @hasMany(() => OrgRole)
  orgRoles: OrgRole[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {}

export type UserWithRelations = User & UserRelations;
