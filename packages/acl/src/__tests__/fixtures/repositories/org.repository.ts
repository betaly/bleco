import {DefaultCrudRepositoryWithQuery} from '@bleco/query';
import {Org} from '../models/org.model';
import {juggler} from '@loopback/repository';
import {inject} from '@loopback/context';

export class OrgRepository extends DefaultCrudRepositoryWithQuery<Org, typeof Org.prototype.id> {
  constructor(@inject(`datasources.db`) dataSource: juggler.DataSource) {
    super(Org, dataSource);
  }
}
