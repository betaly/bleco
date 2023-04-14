import {Policy, defineResourcePolicy} from '../../policies';
import {Issue, Org, Repo} from '../../test';

export const OrgPolicy = defineResourcePolicy({
  model: Org,
  roles: ['owner', 'member'],
  actions: ['manage', 'read', 'create_repos'],
  roleActions: {
    owner: ['manage', 'create_repos'],
    member: ['read'],
  },
  roleDerivations: {
    member: ['owner'],
  },
});

export const RepoPolicy = defineResourcePolicy({
  model: Repo,
  roles: ['admin', 'maintainer', 'reader'],
  relations: ['org'],
  actions: ['read', 'manage'],
  roleActions: {
    admin: ['manage'],
    reader: ['read'],
  },
  roleDerivations: {
    admin: ['org.owner'],
    reader: ['org.member', 'maintainer'],
    maintainer: ['admin'],
  },
});

export const IssuePolicy = defineResourcePolicy({
  model: Issue,
  roles: ['creator'],
  actions: ['read', 'close'],
  relations: ['repo'],
  roleActions: {
    'repo.reader': ['read'],
    'repo.maintainer': ['close'],
    creator: ['close'],
  },
});

export const TestPolicies: Policy[] = [OrgPolicy, RepoPolicy, IssuePolicy];
