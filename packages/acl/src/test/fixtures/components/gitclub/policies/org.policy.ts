import {ResourcePolicy} from '../../../../../policies';
import {Org} from '../models';

export const OrgRoles = {
  owner: 'owner',
  member: 'member',
} as const;

export type OrgRole = typeof OrgRoles[keyof typeof OrgRoles];

export const OrgActions = {
  read: 'read',
  create_repos: 'create_repos',
  list_repos: 'list_repos',
  create_role_assignments: 'create_role_assignments',
  list_role_assignments: 'list_role_assignments',
  update_role_assignments: 'update_role_assignments',
  delete_role_assignments: 'delete_role_assignments',
} as const;

export type OrgAction = typeof OrgActions[keyof typeof OrgActions];

export const OrgPolicy: ResourcePolicy<OrgRole, OrgAction> = {
  type: 'resource',
  model: Org,
  roles: ['owner', 'member'],
  actions: [
    'read',
    'create_repos',
    'list_repos',
    'create_role_assignments',
    'list_role_assignments',
    'update_role_assignments',
    'delete_role_assignments',
  ],
  roleActions: {
    owner: ['create_repos', 'create_role_assignments', 'update_role_assignments', 'delete_role_assignments'],
    member: ['read', 'list_repos', 'list_role_assignments'],
  },
  roleDerivations: {
    member: ['owner'],
  },
};
