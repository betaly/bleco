import {ResourcePolicy} from '../../../../../policy';
import {Repo} from '../models';

export const RepoRoles = {
  admin: 'admin',
  maintainer: 'maintainer',
  reader: 'reader',
} as const;

export type RepoRole = typeof RepoRoles[keyof typeof RepoRoles];

export const RepoPermissions = {
  read: 'read',
  create_issues: 'create_issues',
  list_issues: 'list_issues',
  create_role_assignments: 'create_role_assignments',
  list_role_assignments: 'list_role_assignments',
  update_role_assignments: 'update_role_assignments',
  delete_role_assignments: 'delete_role_assignments',
} as const;

export type RepoPermission = typeof RepoPermissions[keyof typeof RepoPermissions];

export const RepoPolicy: ResourcePolicy<RepoRole, RepoPermission> = {
  type: 'resource',
  model: Repo,
  roles: ['admin', 'maintainer', 'reader'],
  relations: ['org'],
  permissions: [
    'read',
    'create_issues',
    'list_issues',
    'create_role_assignments',
    'list_role_assignments',
    'update_role_assignments',
    'delete_role_assignments',
  ],
  rolePermissions: {
    admin: ['create_role_assignments', 'list_role_assignments', 'update_role_assignments', 'delete_role_assignments'],
    reader: ['read', 'list_issues', 'create_issues'],
  },
  roleInherits: {
    'org.owner': ['admin'],
    'org.member': ['reader'],
    admin: ['maintainer'],
    maintainer: ['reader'],
  },
};
