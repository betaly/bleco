import {juggler} from '@loopback/repository';
import {AclRoleActor, AclRoleActorRelations} from '../models/role-actor.model';
import {DefaultCrudRepositoryWithQuery} from '@bleco/query';
import {inject} from '@loopback/context';
import {AclDataSourceName} from '../types';

export class AclRoleActorRepository extends DefaultCrudRepositoryWithQuery<
  AclRoleActor,
  typeof AclRoleActor.prototype.id,
  AclRoleActorRelations
> {
  constructor(@inject(`datasources.${AclDataSourceName}`) dataSource: juggler.DataSource) {
    super(AclRoleActor, dataSource);
  }
}
