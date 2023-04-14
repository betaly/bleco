import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, Getter, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler, repository} from '@loopback/repository';

import {Repo, RepoRelations} from '../models/repo.model';
import {OrgRepository} from './org.repository';

@injectable({scope: BindingScope.SINGLETON})
export class RepoRepository extends QueryEnhancedCrudRepository<Repo, typeof Repo.prototype.id, RepoRelations> {
  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter('OrgRepository')
    protected orgRepositoryGetter: Getter<OrgRepository>,
  ) {
    super(Repo, dataSource);
  }
}
