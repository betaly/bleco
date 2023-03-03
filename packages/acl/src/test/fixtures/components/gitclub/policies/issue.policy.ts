import {defineResourcePolicy} from '../../../../../policies';
import {Issue} from '../models';

export const IssueRoles = {
  creator: 'creator',
};

export type IssueRole = (typeof IssueRoles)[keyof typeof IssueRoles];

export const IssueActions = {
  read: 'read',
  close: 'close',
};

export type IssueAction = (typeof IssueActions)[keyof typeof IssueActions];

export const IssuePolicy = defineResourcePolicy<IssueRole, IssueAction>({
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
