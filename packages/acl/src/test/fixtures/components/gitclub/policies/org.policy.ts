import {ResourcePolicy} from '../../../../../policy';
import {Org} from '../models';

export const OrgRoles = {
  owner: 'owner',
  member: 'member',
} as const;

export type OrgRole = typeof OrgRoles[keyof typeof OrgRoles];

export const OrgPermissions = {
  read: 'read',
  create_repos: 'create_repos',
  list_repos: 'list_repos',
  create_role_assignments: 'create_role_assignments',
  list_role_assignments: 'list_role_assignments',
  update_role_assignments: 'update_role_assignments',
  delete_role_assignments: 'delete_role_assignments',
} as const;

export type OrgPermission = typeof OrgPermissions[keyof typeof OrgPermissions];

export const OrgPolicy: ResourcePolicy<OrgRole, OrgPermission> = {
  type: 'resource',
  model: Org,
  roles: ['owner', 'member'],
  permissions: [
    'read',
    'create_repos',
    'list_repos',
    'create_role_assignments',
    'list_role_assignments',
    'update_role_assignments',
    'delete_role_assignments',
  ],
  rolePermissions: {
    owner: ['create_repos', 'create_role_assignments', 'update_role_assignments', 'delete_role_assignments'],
    member: ['read', 'list_repos', 'list_role_assignments'],
  },
  roleInherits: {
    owner: ['member'],
  },
};
