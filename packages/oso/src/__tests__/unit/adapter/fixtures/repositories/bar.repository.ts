import {DefaultCrudRepositoryWithQuery} from '@bleco/query';
import {Bar, BarRelations} from '../models/bar.model';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class BarRepository extends DefaultCrudRepositoryWithQuery<Bar, typeof Bar.prototype.id, BarRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Bar, dataSource);
  }
}
