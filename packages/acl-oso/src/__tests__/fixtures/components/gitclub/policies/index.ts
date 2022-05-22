import {OrgPolicy} from './org.policy';
import {RepoPolicy} from './repo.policy';
import {IssuePolicy} from './issue.policy';

export * from './org.policy';
export * from './repo.policy';
export * from './issue.policy';

export const policies = [OrgPolicy, RepoPolicy, IssuePolicy];
