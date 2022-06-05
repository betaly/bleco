/* eslint-disable @typescript-eslint/no-explicit-any */
import {EntityClass} from '@bleco/query';
import {Entity} from '@loopback/repository';

export type PolicyModelType = 'principal' | 'resource';

export type PolicyModel<T extends Entity = Entity> = typeof Entity & {prototype: T};

export interface Policy<Role = string, Action = string> {
  type: PolicyModelType;
  model: PolicyModel;
  actions?: string[];
  roles?: Role[];
  roleActions?: Record<string, Action[]>;
  roleDerivations?: Record<string, string[]>;
  relations?: string[];
  rules?: {
    [key: string]: string[];
  };
}

export interface PrincipalPolicy<Role = string, Action = string> extends Policy<Role, Action> {
  type: 'principal';
}

export interface ResourcePolicy<Role = string, Action = string> extends Policy<Role, Action> {
  type: 'resource';
}

export type RelativeRoles = {
  [rel: string]: string[];
};

export type CompositeRoles = {
  $: string[];
  [rel: string]: string[];
};

export interface CompiledPolicy {
  definition: Policy;
  model: EntityClass;
  /**
   * All actions
   */
  actions: string[];
  roleParents: Record<string, string[]>;
  roleChildren: Record<string, CompositeRoles>;
  /**
   * Action roles are a map of action to roles. This means that if someone has a role for an action, (s)he has the permission to perform that action.
   */
  actionRoles: Record<string, CompositeRoles>;
}

export interface ResolvedPolicy extends CompiledPolicy {
  /**
   * Role actions are a map of role to actions.
   *
   * {
   *   // local role
   *   '$:admin': ['create', 'read', 'update', 'delete'],
   *   // relation role
   *   'repo.org:member': ['create', 'read', 'update', 'delete'],
   * }
   */
  roleActions: Record<string, string[]>;

  /**
   * All roles that are directly related to the policy. Includes local roles and relative roles.
   */
  roles: CompositeRoles;
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
