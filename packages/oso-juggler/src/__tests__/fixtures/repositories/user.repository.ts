import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';

import {User, UserRelations} from '../models/user.model';

@injectable({scope: BindingScope.SINGLETON})
export class UserRepository extends QueryEnhancedCrudRepository<User, typeof User.prototype.id, UserRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(User, dataSource);
  }
}
