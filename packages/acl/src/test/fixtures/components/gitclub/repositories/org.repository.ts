import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from '@bleco/query';
import {injectable} from '@loopback/core';
import {Org} from '../models';

@injectable({scope: BindingScope.SINGLETON})
export class OrgRepository extends QueryEnhancedCrudRepository<Org, typeof Org.prototype.id> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Org, dataSource);
  }
}
