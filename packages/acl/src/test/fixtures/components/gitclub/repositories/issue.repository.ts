import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {injectable} from '@loopback/core';
import {Issue, IssueRelations} from '../models';

@injectable({scope: BindingScope.SINGLETON})
export class IssueRepository extends QueryEnhancedCrudRepository<Issue, typeof Issue.prototype.id, IssueRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Issue, dataSource);
  }
}
