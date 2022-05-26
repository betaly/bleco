import {QueryEnhancedCrudRepository} from '@bleco/query';
import {Log, LogRelations} from '../models/log.model';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class LogRepository extends QueryEnhancedCrudRepository<Log, typeof Log.prototype.id, LogRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Log, dataSource);
  }
}
