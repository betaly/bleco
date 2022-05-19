import {QueryEnhancedCrudRepository} from '@bleco/query';
import {RolePermission, RolePermissionRelations} from '../models';
import {inject} from '@loopback/context';
import {AclDataSourceName} from '../types';
import {juggler} from '@loopback/repository';

export class RolePermissionRepository extends QueryEnhancedCrudRepository<
  RolePermission,
  typeof RolePermission.prototype.id,
  RolePermissionRelations
> {
  constructor(
    @inject(`datasources.${AclDataSourceName}`)
    dataSource: juggler.DataSource,
  ) {
    super(RolePermission, dataSource);
  }
}
