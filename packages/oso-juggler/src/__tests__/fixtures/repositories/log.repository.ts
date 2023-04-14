import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';

import {Log, LogRelations} from '../models/log.model';

@injectable({scope: BindingScope.SINGLETON})
export class LogRepository extends QueryEnhancedCrudRepository<Log, typeof Log.prototype.id, LogRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Log, dataSource);
  }
}
