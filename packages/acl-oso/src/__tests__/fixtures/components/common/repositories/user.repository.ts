import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {User, UserRelations} from '../models/user.model';
import {injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class UserRepository extends QueryEnhancedCrudRepository<User, typeof User.prototype.id, UserRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(User, dataSource);
  }
}
