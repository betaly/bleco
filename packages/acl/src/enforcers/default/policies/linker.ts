import {Entity} from '@loopback/repository';
import {cloneDeep} from 'lodash';
import uniq from 'tily/array/uniq';
import mergeWith from 'tily/object/mergeWith';
import {Constructor} from 'tily/typings/types';

import {CompiledPolicy, CompositeRoles, RelativeRoles, ResolvedPolicy, resolveModelName} from '../../../policies';

export function link(policies: CompiledPolicy[]): ResolvedPolicy[] {
  return policies.map(policy => {
    const resolved: ResolvedPolicy = {
      ...cloneDeep(policy),
      roleActions: {},
      roles: {_: []},
    };

    // link action roles
    for (const action in resolved.actionRoles) {
      resolved.actionRoles[action] = resolveActionRoles(policies, resolved.definition.name, action);
    }

    // link role actions by action roles
    for (const action in resolved.actionRoles) {
      const roles = resolved.actionRoles[action];
      for (const rel in roles) {
        for (const role of roles[rel]) {
          const key = `${rel}:${role}`;
          resolved.roleActions[key] = resolved.roleActions[key] ?? [];
          resolved.roleActions[key].push(action);
        }
      }
    }
    for (const role in resolved.roleActions) {
      resolved.roleActions[role] = uniq(resolved.roleActions[role]);
    }

    // combine all roles
    resolved.roles = Object.keys(resolved.actionRoles).reduce((acc, action) => {
      return mergeWith((a, b) => uniq([...a, ...b]), acc, resolved.actionRoles[action]) as CompositeRoles;
    }, {} as CompositeRoles);

    return resolved;
  });
}

function resolveActionRoles(
  policies: CompiledPolicy[],
  resource: string | Constructor<Entity> | Entity,
  action: string,
): CompositeRoles {
  const name = resolveModelName(resource);
  const policy = policies.find(p => p.definition.name === name);
  if (!policy) {
    throw new Error(`No policy found for resource ${name}`);
  }
  const roles = policy.actionRoles[action];
  if (!roles) {
    throw new Error(`No roles found for action ${action} in ${name}`);
  }

  return resolveRolesRecursion(policies, resource, roles);
}

function resolveRolesRecursion(
  policies: CompiledPolicy[],
  resource: string | Constructor<Entity> | Entity,
  roles: CompositeRoles,
): CompositeRoles {
  const name = resolveModelName(resource);
  const policy = policies.find(p => p.definition.name === name);
  if (!policy) {
    throw new Error(`No policy found for resource ${name}`);
  }
  const model = policy.model;
  const {_, ...relRoles} = roles;
  const resolved: CompositeRoles = {_};
  for (const rel in relRoles) {
    const resolvedRelRoles = resolveRelativeRoles(
      policies,
      model ? model.definition.relations[rel].target() : name,
      roles[rel],
      rel,
    );
    for (const r in resolvedRelRoles) {
      resolved[r] = uniq([...(roles[r] ?? []), ...resolvedRelRoles[r]]);
    }
  }
  return resolved;
}

function resolveRelativeRoles(
  policies: CompiledPolicy[],
  nameOrModel: string | typeof Entity,
  roles: string[],
  prefix: string,
): RelativeRoles {
  const name = resolveModelName(nameOrModel);
  const policy = policies.find(p => p.definition.name === name);
  if (!policy) {
    throw new Error(`No policy found for resource ${name}`);
  }

  const children = roles.reduce((acc, role) => {
    const childRoles = policy.roleChildren[role];
    if (childRoles) {
      for (const rel in childRoles) {
        acc[rel] = acc[rel] ?? [];
        acc[rel].push(...childRoles[rel]);
      }
    }
    return acc;
  }, {} as CompositeRoles);

  const {_, ...relativeRoles} = children;

  const resolved: RelativeRoles = {
    [prefix]: [...roles, ...(_ ?? [])],
  };

  for (const rel in relativeRoles) {
    const key = `${prefix}.${rel}`;
    resolved[key] = resolved[key] ?? [];
    resolved[key].push(...children[rel]);
  }

  if (policy.model) {
    for (const rel in relativeRoles) {
      const key = `${prefix}.${rel}`;
      const relRoles = resolveRelativeRoles(
        policies,
        policy.model.definition.relations[rel].target(),
        children[rel],
        key,
      );
      for (const relRole in relRoles) {
        resolved[relRole] = resolved[relRole] ?? [];
        resolved[relRole].push(...relRoles[relRole]);
      }
    }
  }

  for (const rel in resolved) {
    resolved[rel] = uniq(resolved[rel]);
  }

  return resolved;
}
