import {ResourcePolicy} from '../../../../../policies';
import {Site} from '../models';

export const SiteRoles = {
  admin: 'admin',
  member: 'member',
} as const;

export type SiteRole = typeof SiteRoles[keyof typeof SiteRoles];

export const SiteActions = {
  manage: 'manage',
  create_orgs: 'create_orgs',
} as const;

export type SiteAction = typeof SiteActions[keyof typeof SiteActions];

export const SitePolicy: ResourcePolicy<SiteRole, SiteAction> = {
  type: 'resource',
  model: Site,
  roles: ['admin', 'member'],
  actions: Object.values(SiteActions),
  roleActions: {
    admin: ['manage'],
    member: ['create_orgs'],
  },
  roleDerivations: {
    member: ['admin'],
  },
};
