import {BindingScope, inject} from '@loopback/context';
import {injectable} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {QueryEnhancedCrudRepository} from 'loopback4-query';

import {Issue, IssueRelations} from '../models/issue.model';

@injectable({scope: BindingScope.SINGLETON})
export class IssueRepository extends QueryEnhancedCrudRepository<Issue, typeof Issue.prototype.id, IssueRelations> {
  constructor(@inject('datasources.db') dataSource: juggler.DataSource) {
    super(Issue, dataSource);
  }
}
