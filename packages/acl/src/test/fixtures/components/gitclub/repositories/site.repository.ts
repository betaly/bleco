import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {Global} from '../models';

@injectable({scope: BindingScope.SINGLETON})
export class SiteRepository extends QueryEnhancedCrudRepository<Global, typeof Global.prototype.id> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Global, dataSource);
  }
}
