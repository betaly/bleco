import {Entity} from '@loopback/repository';
import {AnyRecord} from './types';

export type PolicyModelType = 'principal' | 'resource';

export type PolicyModel<T extends Entity = Entity> = typeof Entity & {prototype: T};

export interface Policy<Role = string, Permission = string> {
  type: PolicyModelType;
  model: PolicyModel;
  permissions?: string[];
  roles?: Role[];
  rolePermissions?: Record<string, Permission[]>;
  roleInherits?: Record<string, Role[] | Record<string, Role[]>>;
  relations?: Record<string, {model: string; property?: string} | string>;
  rules?: AnyRecord;
}

export interface PrincipalPolicy<Role = string, Permission = string> extends Policy<Role, Permission> {
  type: 'principal';
}

export interface ResourcePolicy<Role = string, Permission = string> extends Policy<Role, Permission> {
  type: 'resource';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPolicy(x: any): x is Policy {
  return x?.type !== undefined && x.model !== undefined;
}
