import {QueryEnhancedCrudRepository} from '@bleco/query';
import {BindingScope, inject} from '@loopback/context';
import {juggler} from '@loopback/repository';
import {Issue, IssueRelations} from '../models/issue.model';
import {injectable} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class IssueRepository extends QueryEnhancedCrudRepository<Issue, typeof Issue.prototype.id, IssueRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Issue, dataSource);
  }
}
