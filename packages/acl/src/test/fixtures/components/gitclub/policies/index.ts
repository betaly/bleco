import {IssuePolicy} from './issue.policy';
import {OrgPolicy} from './org.policy';
import {RepoPolicy} from './repo.policy';
import {GlobalPolicy} from './global.policy';

export * from './issue.policy';
export * from './org.policy';
export * from './repo.policy';
export * from './global.policy';

export const policies = [OrgPolicy, RepoPolicy, IssuePolicy, GlobalPolicy];
