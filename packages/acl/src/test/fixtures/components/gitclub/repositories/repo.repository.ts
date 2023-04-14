import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, Getter, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';

import {Org, Repo, RepoRelations} from '../models';
import {OrgRepository} from './org.repository';

@injectable({scope: BindingScope.SINGLETON})
export class RepoRepository extends QueryEnhancedCrudRepository<Repo, typeof Repo.prototype.id, RepoRelations> {
  org: BelongsToAccessor<Org, typeof Repo.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: juggler.DataSource,
    @repository.getter('OrgRepository')
    protected orgRepositoryGetter: Getter<OrgRepository>,
  ) {
    super(Repo, dataSource);

    this.org = this.createBelongsToAccessorFor('org', orgRepositoryGetter);
    this.registerInclusionResolver('org', this.org.inclusionResolver);
  }
}
