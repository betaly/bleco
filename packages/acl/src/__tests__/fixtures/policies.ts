import {Policy, ResourcePolicy} from '../../policies';
import {Issue, IssueAction, IssueRole, Org, Repo} from '../../test';

export const OrgPolicy: Policy = {
  type: 'resource',
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
};

export const RepoPolicy: Policy = {
  model: Repo,
  type: 'resource',
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
};

export const IssuePolicy: ResourcePolicy<IssueRole, IssueAction> = {
  type: 'resource',
  model: Issue,
  roles: ['creator'],
  actions: ['read', 'close'],
  relations: ['repo'],
  roleActions: {
    'repo.reader': ['read'],
    'repo.maintainer': ['close'],
    creator: ['close'],
  },
};

export const TestPolicies: Policy[] = [OrgPolicy, RepoPolicy, IssuePolicy];
