import {IssueRepository} from './issue.repository';
import {OrgRepository} from './org.repository';
import {RepoRepository} from './repo.repository';

export * from './issue.repository';
export * from './org.repository';
export * from './repo.repository';

export const repositories = [OrgRepository, RepoRepository, IssueRepository];
