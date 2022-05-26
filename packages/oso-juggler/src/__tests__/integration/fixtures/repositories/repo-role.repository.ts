import {QueryEnhancedCrudRepository} from '@bleco/query';
import {RepoRole, RepoRoleRelations} from '../models/repo-role.model';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class RepoRoleRepository extends QueryEnhancedCrudRepository<
  RepoRole,
  typeof RepoRole.prototype.id,
  RepoRoleRelations
> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(RepoRole, dataSource);
  }
}
