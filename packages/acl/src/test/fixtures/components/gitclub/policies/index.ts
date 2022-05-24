import {UserPolicy} from './user.policy';
import {OrgPolicy} from './org.policy';
import {RepoPolicy} from './repo.policy';
import {IssuePolicy} from './issue.policy';

export * from './user.policy';
export * from './org.policy';
export * from './repo.policy';
export * from './issue.policy';

export const policies = [UserPolicy, OrgPolicy, RepoPolicy, IssuePolicy];
