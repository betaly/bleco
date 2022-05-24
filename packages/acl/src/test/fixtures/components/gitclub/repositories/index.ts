import {UserRepository} from './user.repository';
import {OrgRepository} from './org.repository';
import {RepoRepository} from './repo.repository';
import {IssueRepository} from './issue.repository';

export * from './user.repository';
export * from './org.repository';
export * from './repo.repository';
export * from './issue.repository';

export const repositories = [UserRepository, OrgRepository, RepoRepository, IssueRepository];
