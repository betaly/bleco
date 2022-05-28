import {ResourcePolicy} from '../../../../../policies';
import {Site} from '../models';

export const SiteRoles = {
  admin: 'admin',
  member: 'member',
} as const;

export type SiteRole = typeof SiteRoles[keyof typeof SiteRoles];

export const SitePermissions = {
  manage: 'manage',
  create_orgs: 'create_orgs',
} as const;

export type SitePermission = typeof SitePermissions[keyof typeof SitePermissions];

export const SitePolicy: ResourcePolicy<SiteRole, SitePermission> = {
  type: 'resource',
  model: Site,
  roles: ['admin', 'member'],
  permissions: Object.values(SitePermissions),
  rolePermissions: {
    admin: ['manage'],
    member: ['create_orgs'],
  },
  roleInherits: {
    admin: ['member'],
  },
};
