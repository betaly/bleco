import {ResourcePolicy} from '../../../../../policies';
import {Global} from '../models';

export const GlobalRoles = {
  admin: 'admin',
  member: 'member',
} as const;

export type GlobalRole = typeof GlobalRoles[keyof typeof GlobalRoles];

export const GlobalActions = {
  manage: 'manage',
  create_orgs: 'create_orgs',
} as const;

export type GlobalAction = typeof GlobalActions[keyof typeof GlobalActions];

export const GlobalPolicy: ResourcePolicy<GlobalRole, GlobalAction> = {
  type: 'resource',
  model: Global,
  roles: ['admin', 'member'],
  actions: Object.values(GlobalActions),
  roleActions: {
    admin: ['manage'],
    member: ['create_orgs'],
  },
  roleDerivations: {
    member: ['admin'],
  },
};
