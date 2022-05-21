import {ResourcePolicy} from '../../../policy';
import {Repo} from '../models';
import {OrgRoles} from './org.policy';

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
  roles: Object.values(RepoRoles),
  permissions: Object.values(RepoPermissions),
  relations: {org: 'Org'},
  roleInherits: {
    [RepoRoles.admin]: [RepoRoles.maintainer],
    [RepoRoles.maintainer]: [RepoRoles.reader],
    org: {
      [OrgRoles.owner]: [RepoRoles.admin],
      [OrgRoles.member]: [RepoRoles.reader],
    },
  },
  rolePermissions: {
    [RepoRoles.admin]: [
      RepoPermissions.create_role_assignments,
      RepoPermissions.list_role_assignments,
      RepoPermissions.update_role_assignments,
      RepoPermissions.delete_role_assignments,
    ],
    [RepoRoles.reader]: [RepoPermissions.read, RepoPermissions.list_issues, RepoPermissions.create_issues],
  },
};
