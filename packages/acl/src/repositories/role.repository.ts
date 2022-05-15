import {juggler} from '@loopback/repository';
import {AclRole, AclRoleRelations} from '../models/role.model';
import {DefaultCrudRepositoryWithQuery} from '@bleco/query';
import {inject} from '@loopback/context';
import {AclDataSourceName} from '../types';

export class AclRoleRepository extends DefaultCrudRepositoryWithQuery<
  AclRole,
  typeof AclRole.prototype.id,
  AclRoleRelations
> {
  constructor(@inject(`datasources.${AclDataSourceName}`) dataSource: juggler.DataSource) {
    super(AclRole, dataSource);
  }
}
