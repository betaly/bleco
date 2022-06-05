import {IssueRepository} from './issue.repository';
import {OrgRepository} from './org.repository';
import {RepoRepository} from './repo.repository';
import {SiteRepository} from './site.repository';

export * from './issue.repository';
export * from './org.repository';
export * from './repo.repository';
export * from './site.repository';

export const repositories = [SiteRepository, OrgRepository, RepoRepository, IssueRepository];
