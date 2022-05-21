import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Org} from './org.model';

@model()
export class Repo extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @belongsTo(() => Org)
  orgId: string;

  constructor(data?: Partial<Repo>) {
    super(data);
  }
}

export interface RepoRelations {
  // describe navigational properties here
  org?: Org;
}

export type RepoWithRelations = Repo & RepoRelations;
