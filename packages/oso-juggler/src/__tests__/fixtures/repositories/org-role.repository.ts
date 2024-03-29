import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {OrgRole, OrgRoleRelations} from '../models/org-role.model';

@injectable({scope: BindingScope.SINGLETON})
export class OrgRoleRepository extends QueryEnhancedCrudRepository<
  OrgRole,
  typeof OrgRole.prototype.id,
  OrgRoleRelations
> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(OrgRole, dataSource);
  }
}
