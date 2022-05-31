import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {RepoRole, RepoRoleRelations} from '../models/repo-role.model';

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
