import flatten from 'tily/array/flatten';
import uniq from 'tily/array/uniq';
import isArray from 'tily/is/array';
import {CompiledPolicy, CompositeRoles, Policy} from '../../../policies';

export function compile(policy: Policy): CompiledPolicy;
export function compile(policy: Policy[]): CompiledPolicy[];
export function compile(policy: Policy | Policy[]): CompiledPolicy | CompiledPolicy[] {
  if (isArray(policy)) {
    return policy.map(policy => compile(policy));
  }

  const resolved: CompiledPolicy = {
    definition: policy,
    model: policy.model,
    actions: policy.actions ?? [],
    roleParents: {},
    roleChildren: {},
    actionRoles: {},
  };
  const roles = uniq([...(policy.roles ?? []), ...flatten<string>(Object.values(policy.roleDerivations ?? {}))]);
  roles.forEach(role => {
    resolved.roleParents[role] = [...resolveParentRoles(policy, role, new Set<string>())];
  });

  policy.roles?.forEach(role => {
    const roleChildren: string[] = [];
    for (const parent in resolved.roleParents) {
      if (resolved.roleParents[parent].includes(role)) {
        roleChildren.push(parent);
      }
    }
    resolved.roleChildren[role] = normalizeRoles(roleChildren);
  });

  policy.actions?.forEach(action => {
    for (const role in policy.roleActions) {
      if (policy.roleActions[role].includes(action)) {
        resolved.actionRoles[action] = resolved.actionRoles[action] ?? {$: []};
        const actionRoles: CompositeRoles = resolved.actionRoles[action];
        if (role.includes('.')) {
          const [relName, relRole] = role.split('.');
          actionRoles[relName] = uniq([...(actionRoles[relName] ?? []), relRole]);
        } else {
          actionRoles.$.push(role);
        }

        const children = resolved.roleChildren[role];
        for (const rel in children) {
          actionRoles[rel] = uniq([...(actionRoles[rel] ?? []), ...children[rel]]);
        }
      }
    }
  });

  return resolved;
}

function resolveParentRoles(policy: Policy, role: string, parentRoles: Set<string>) {
  for (const parent in policy.roleDerivations) {
    if (policy.roleDerivations[parent].includes(role)) {
      parentRoles.add(parent);
      resolveParentRoles(policy, parent, parentRoles);
    }
  }
  return parentRoles;
}

function normalizeRoles(roles: string[]): CompositeRoles {
  const resolved: CompositeRoles = {
    $: [],
  };
  roles.forEach(role => {
    if (role.includes('.')) {
      const [relName, relRole] = role.split('.');
      resolved[relName] = resolved[relName] ?? [];
      resolved[relName].push(relRole);
    } else {
      resolved.$.push(role);
    }
  });
  return resolved;
}
