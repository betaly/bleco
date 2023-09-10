import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {Org} from '../models/org.model';

@injectable({scope: BindingScope.SINGLETON})
export class OrgRepository extends QueryEnhancedCrudRepository<Org, typeof Org.prototype.id> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Org, dataSource);
  }
}
