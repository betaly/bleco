import {QueryEnhancedCrudRepository} from '@bleco/query';
import {juggler} from '@loopback/repository';
import {inject} from '@loopback/context';
import {Org} from '../models';

export class OrgRepository extends QueryEnhancedCrudRepository<Org, typeof Org.prototype.id> {
  constructor(@inject(`datasources.db`) dataSource: juggler.DataSource) {
    super(Org, dataSource);
  }
}
