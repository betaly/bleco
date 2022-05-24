/* eslint-disable @typescript-eslint/no-explicit-any */
import {Entity} from '@loopback/repository';

export type PolicyModelType = 'principal' | 'resource';

export type PolicyModel<T extends Entity = Entity> = typeof Entity & {prototype: T};

export interface Policy<Role = string, Permission = string> {
  type: PolicyModelType;
  model: PolicyModel;
  permissions?: string[];
  roles?: Role[];
  rolePermissions?: Record<string, Permission[]>;
  roleInherits?: Record<string, Role[]>;
  relations?: string[];
  rules?: {
    [key: string]: string[];
  };
}

export interface PrincipalPolicy<Role = string, Permission = string> extends Policy<Role, Permission> {
  type: 'principal';
}

export interface ResourcePolicy<Role = string, Permission = string> extends Policy<Role, Permission> {
  type: 'resource';
}

export function isPolicy(x: any): x is Policy {
  return x?.type !== undefined && x.model !== undefined;
}

export function isPrincipalPolicy(x: any): x is PrincipalPolicy {
  return x?.type === 'principal';
}

export function isResourcePolicy(x: any): x is ResourcePolicy {
  return x?.type === 'resource';
}
