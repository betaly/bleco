import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {BelongsToAccessor, Getter, juggler, repository} from '@loopback/repository';

import {Issue, IssueRelations, Repo} from '../models';
import {RepoRepository} from './repo.repository';

@injectable({scope: BindingScope.SINGLETON})
export class IssueRepository extends QueryEnhancedCrudRepository<Issue, typeof Issue.prototype.id, IssueRelations> {
  repo: BelongsToAccessor<Repo, typeof Issue.prototype.id>;

  constructor(
    @inject('datasources.db')
    dataSource: juggler.DataSource,
    @repository.getter('RepoRepository')
    protected repoRepositoryGetter: Getter<RepoRepository>,
  ) {
    super(Issue, dataSource);
    this.repo = this.createBelongsToAccessorFor('repo', repoRepositoryGetter);
    this.registerInclusionResolver('repo', this.repo.inclusionResolver);
  }
}
