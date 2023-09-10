import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {Bar, BarRelations} from '../models/bar.model';

@injectable({scope: BindingScope.SINGLETON})
export class BarRepository extends QueryEnhancedCrudRepository<Bar, typeof Bar.prototype.id, BarRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Bar, dataSource);
  }
}
