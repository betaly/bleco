import {BindingScope, Getter, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {BelongsToAccessor, juggler, repository} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {Global, Org} from '../models';
import {GlobalRepository} from './global.repository';

@injectable({scope: BindingScope.SINGLETON})
export class OrgRepository extends QueryEnhancedCrudRepository<Org, typeof Org.prototype.id> {
  global: BelongsToAccessor<Global, typeof Org.prototype.id>;

  constructor(
    @inject('datasources.db')
    dataSource: juggler.DataSource,
    @repository.getter('GlobalRepository')
    protected globalRepositoryGetter: Getter<GlobalRepository>,
  ) {
    super(Org, dataSource);

    this.global = this.createBelongsToAccessorFor('global', this.globalRepositoryGetter);
    this.registerInclusionResolver('global', this.global.inclusionResolver);
  }
}
