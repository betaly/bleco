import {ResourcePolicy} from '../../../../../policies';
import {Issue} from '../models';

export const IssueRoles = {
  creator: 'creator',
};

export type IssueRole = typeof IssueRoles[keyof typeof IssueRoles];

export const IssuePermissions = {
  read: 'read',
  close: 'close',
};

export type IssuePermission = typeof IssuePermissions[keyof typeof IssuePermissions];

export const IssuePolicy: ResourcePolicy<IssueRole, IssuePermission> = {
  type: 'resource',
  model: Issue,
  roles: ['creator'],
  permissions: ['read', 'close'],
  relations: ['repo'],
  rolePermissions: {
    'repo.reader': ['read'],
    'repo.maintainer': ['close'],
    creator: ['close'],
  },
};
