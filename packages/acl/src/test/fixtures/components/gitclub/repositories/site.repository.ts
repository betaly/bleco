import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {Site} from '../models';

@injectable({scope: BindingScope.SINGLETON})
export class SiteRepository extends QueryEnhancedCrudRepository<Site, typeof Site.prototype.id> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Site, dataSource);
  }
}
