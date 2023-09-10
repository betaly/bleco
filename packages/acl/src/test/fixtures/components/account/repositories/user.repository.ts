import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {User, UserRelations} from '../models';

@injectable({scope: BindingScope.SINGLETON})
export class UserRepository extends QueryEnhancedCrudRepository<User, typeof User.prototype.id, UserRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(User, dataSource);
  }
}
