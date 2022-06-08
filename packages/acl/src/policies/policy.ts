/* eslint-disable @typescript-eslint/no-explicit-any */
import {Entity} from '@loopback/repository';
import {MarkOptional, MarkRequired, ValueOf} from 'ts-essentials';

export const PolicyModelType = {
  principal: 'principal',
  resource: 'resource',
};

export type PolicyModelType = ValueOf<typeof PolicyModelType>;

export const PolicyModelTypes = Object.values(PolicyModelType);

export type PolicyModel<T extends Entity = Entity> = typeof Entity & {prototype: T};

export interface Policy<Role = string, Action = string> {
  type: PolicyModelType;
  name: string;
  model?: PolicyModel;
  actions?: string[];
  roles?: Role[];
  roleActions?: Record<string, Action[]>;
  roleDerivations?: Record<string, string[]>;
  relations?: string[];
  rules?: Record<string, string[]>;
}

export type RelativeRoles = {
  [rel: string]: string[];
};

export type CompositeRoles = {
  _: string[];
  [rel: string]: string[];
};

export interface CompiledPolicy {
  definition: Policy;
  model?: typeof Entity;
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
   *   '_:admin': ['create', 'read', 'update', 'delete'],
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
  return PolicyModelTypes.includes(x?.type);
}

export type PolicyExcludeType<Role = string, Action = string> = Omit<Policy<Role, Action>, 'type'>;
export type PolicyDefinitionOptions<Role = string, Action = string> =
  | PolicyExcludeType<Role, Action>
  | MarkOptional<MarkRequired<PolicyExcludeType<Role, Action>, 'model'>, 'name'>;

export function definePolicy<Role = string, Action = string>(
  type: PolicyModelType,
  definition: PolicyDefinitionOptions<Role, Action>,
): Policy<Role, Action> {
  if (!definition.name && !definition.model) {
    throw new Error(`Policy definition must have either a name or a model`);
  }
  const name = (definition.name ?? definition.model?.modelName)!;
  return {
    type,
    name,
    ...definition,
  };
}

export function defineResourcePolicy<Role = string, Action = string>(
  definition: PolicyDefinitionOptions<Role, Action>,
): Policy<Role, Action> {
  return definePolicy(PolicyModelType.resource, definition);
}

export function definePrincipalPolicy<Role = string, Action = string>(
  definition: PolicyDefinitionOptions<Role, Action>,
): Policy<Role, Action> {
  return definePolicy(PolicyModelType.principal, definition);
}
