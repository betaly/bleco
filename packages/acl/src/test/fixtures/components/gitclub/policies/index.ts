import {IssuePolicy} from './issue.policy';
import {OrgPolicy} from './org.policy';
import {RepoPolicy} from './repo.policy';
import {SitePolicy} from './site.policy';

export * from './issue.policy';
export * from './org.policy';
export * from './repo.policy';
export * from './site.policy';

export const policies = [OrgPolicy, RepoPolicy, IssuePolicy, SitePolicy];
