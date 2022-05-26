import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {OrgRole, OrgRoleRelations} from '../models/org-role.model';
import {injectable} from '@loopback/core';

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
