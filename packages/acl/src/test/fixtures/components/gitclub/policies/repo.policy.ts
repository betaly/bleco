import {defineResourcePolicy} from '../../../../../policies';
import {Repo} from '../models';

export const RepoRoles = {
  admin: 'admin',
  maintainer: 'maintainer',
  reader: 'reader',
} as const;

export type RepoRole = typeof RepoRoles[keyof typeof RepoRoles];

export const RepoActions = {
  read: 'read',
  create_issues: 'create_issues',
  list_issues: 'list_issues',
  create_role_assignments: 'create_role_assignments',
  list_role_assignments: 'list_role_assignments',
  update_role_assignments: 'update_role_assignments',
  delete_role_assignments: 'delete_role_assignments',
} as const;

export type RepoAction = typeof RepoActions[keyof typeof RepoActions];

export const RepoPolicy = defineResourcePolicy<RepoRole, RepoAction>({
  model: Repo,
  roles: ['admin', 'maintainer', 'reader'],
  relations: ['org'],
  actions: [
    'read',
    'create_issues',
    'list_issues',
    'create_role_assignments',
    'list_role_assignments',
    'update_role_assignments',
    'delete_role_assignments',
  ],
  roleActions: {
    admin: ['create_role_assignments', 'list_role_assignments', 'update_role_assignments', 'delete_role_assignments'],
    reader: ['read', 'list_issues', 'create_issues'],
  },
  roleDerivations: {
    admin: ['org.owner'],
    reader: ['org.member', 'maintainer'],
    maintainer: ['admin'],
  },
});
