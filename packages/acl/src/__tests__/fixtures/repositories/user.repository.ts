import {DefaultCrudRepositoryWithQuery} from '@bleco/query';
import {User} from '../models/user.model';
import {juggler} from '@loopback/repository';
import {inject} from '@loopback/context';

export class UserRepository extends DefaultCrudRepositoryWithQuery<User, typeof User.prototype.id> {
  constructor(@inject(`datasources.db`) dataSource: juggler.DataSource) {
    super(User, dataSource);
  }
}
