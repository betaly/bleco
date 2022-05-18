import {Org} from '../models';
import {ResourcePolicy} from '../../../policy';

export const OrgRoles = {
  owner: 'owner',
  member: 'member',
} as const;

export const OrgPermissions = {
  read: 'read',
  create_repos: 'create_repos',
  list_repos: 'list_repos',
  create_role_assignments: 'create_role_assignments',
  list_role_assignments: 'list_role_assignments',
  update_role_assignments: 'update_role_assignments',
  delete_role_assignments: 'delete_role_assignments',
} as const;

export const OrgPolicy: ResourcePolicy = {
  type: 'resource',
  model: Org,
  permissions: Object.values(OrgPermissions),
  roles: [OrgRoles.owner, OrgRoles.member],
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
