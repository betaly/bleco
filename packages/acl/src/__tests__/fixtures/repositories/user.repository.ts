import {QueryEnhancedCrudRepository} from '@bleco/query';
import {juggler} from '@loopback/repository';
import {inject} from '@loopback/context';
import {User} from '../models';

export class UserRepository extends QueryEnhancedCrudRepository<User, typeof User.prototype.id> {
  constructor(@inject(`datasources.db`) dataSource: juggler.DataSource) {
    super(User, dataSource);
  }
}
