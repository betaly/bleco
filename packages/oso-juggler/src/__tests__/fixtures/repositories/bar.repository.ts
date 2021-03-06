import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {Bar, BarRelations} from '../models/bar.model';

@injectable({scope: BindingScope.SINGLETON})
export class BarRepository extends QueryEnhancedCrudRepository<Bar, typeof Bar.prototype.id, BarRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Bar, dataSource);
  }
}
