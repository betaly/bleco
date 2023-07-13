import {inject} from '@loopback/core';
import {SequelizeCrudRepository, SequelizeDataSource} from '@loopback/sequelize';

import {AuditLog} from '../../models';
import {AuditDbSourceName} from '../../types';

export class AuditLogRepository extends SequelizeCrudRepository<AuditLog, typeof AuditLog.prototype.id> {
  constructor(@inject(`datasources.${AuditDbSourceName}`) dataSource: SequelizeDataSource) {
    super(AuditLog, dataSource);
  }
}
