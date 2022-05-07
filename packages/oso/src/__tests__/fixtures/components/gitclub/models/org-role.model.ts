import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Org} from './org.model';
import {User} from '../../common/models/user.model';

@model()
export class OrgRole extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property()
  name: string;

  @belongsTo(() => Org)
  orgId: number;

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<OrgRole>) {
    super(data);
  }
}

export interface OrgRoleRelations {
  org: Org;
  user: User;
}

export type OrgRoleWithRelations = OrgRole & OrgRoleRelations;
