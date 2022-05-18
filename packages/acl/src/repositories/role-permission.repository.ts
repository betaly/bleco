import {QueryEnhancedCrudRepository} from '@bleco/query';
import {AclRolePermission, AclRolePermissionRelations} from '../models';
import {inject} from '@loopback/context';
import {AclDataSourceName} from '../types';
import {juggler} from '@loopback/repository';

export class AclRolePermissionRepository extends QueryEnhancedCrudRepository<
  AclRolePermission,
  typeof AclRolePermission.prototype.id,
  AclRolePermissionRelations
> {
  constructor(
    @inject(`datasources.${AclDataSourceName}`)
    dataSource: juggler.DataSource,
  ) {
    super(AclRolePermission, dataSource);
  }
}
