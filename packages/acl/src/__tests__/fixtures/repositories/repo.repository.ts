import {inject} from '@loopback/context';
import {QueryEnhancedCrudRepository} from '@bleco/query';
import {Repo, RepoRelations} from '../models';
import {juggler} from '@loopback/repository';

export class RepoRepository extends QueryEnhancedCrudRepository<Repo, typeof Repo.prototype.id, RepoRelations> {
  constructor(@inject(`datasources.db`) dataSource: juggler.DataSource) {
    super(Repo, dataSource);
  }
}
