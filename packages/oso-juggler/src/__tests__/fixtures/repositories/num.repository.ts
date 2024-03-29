import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {Num} from '../models/num.model';

@injectable({scope: BindingScope.SINGLETON})
export class NumRepository extends QueryEnhancedCrudRepository<Num, typeof Num.prototype.fooId> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Num, dataSource);
  }
}
