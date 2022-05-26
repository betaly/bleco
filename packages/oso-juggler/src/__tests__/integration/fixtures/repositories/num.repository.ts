import {QueryEnhancedCrudRepository} from '@bleco/query';
import {Num} from '../models/num.model';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class NumRepository extends QueryEnhancedCrudRepository<Num, typeof Num.prototype.fooId> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Num, dataSource);
  }
}
