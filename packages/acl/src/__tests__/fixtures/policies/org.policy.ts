import {Org} from '../models';
import {ResourcePolicy} from '../../../policy';

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
  roles: Object.values(OrgRoles),
  permissions: Object.values(OrgPermissions),
  roleInherits: {
    [OrgRoles.owner]: [OrgRoles.member],
  },
  rolePermissions: {
    [OrgRoles.owner]: [
      OrgPermissions.create_repos,
      OrgPermissions.create_role_assignments,
      OrgPermissions.update_role_assignments,
      OrgPermissions.delete_role_assignments,
    ],
    [OrgRoles.member]: [OrgPermissions.read, OrgPermissions.list_repos, OrgPermissions.list_role_assignments],
  },
};
