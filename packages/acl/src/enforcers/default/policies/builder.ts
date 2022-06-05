import {Entity, Inclusion} from '@loopback/repository';
import {toArray} from 'tily/array/toArray';
import uniq from 'tily/array/uniq';
import isEmpty from 'tily/is/empty';
import {Constructor} from 'tily/typings/types';
import {CompositeRoles, Policy, ResolvedPolicy, resolveModelName} from '../../../policies';
import {compile} from './compiler';
import {link} from './linker';

export class PolicyBuilder {
  protected policies = new Map<string, ResolvedPolicy>();

  constructor(policies: Policy[]) {
    const compiled = compile(policies);
    const resolved = link(compiled);
    this.policies = new Map(resolved.map(r => [r.model.modelName, r]));
  }

  has(name: string | Constructor | object) {
    return this.policies.has(resolveModelName(name));
  }

  find(name: string | Constructor | object) {
    return this.policies.get(resolveModelName(name));
  }

  get(name: string | Constructor | object) {
    const n = resolveModelName(name);
    const policy = this.find(n);
    if (!policy) {
      throw new Error(`Policy ${n} not found`);
    }
    return policy;
  }

  resolveActionsRoles(resource: typeof Entity | Entity, actions: string | string[]) {
    actions = toArray(actions);
    const resourceCls = (typeof resource === 'function' ? resource : resource.constructor) as typeof Entity;
    const policy = this.get(resourceCls);
    return actions
      .map(action => policy.actionRoles[action])
      .reduce((acc, roles) => {
        for (const role in roles) {
          acc[role] = uniq([...(acc[role] ?? []), ...roles[role]]);
        }
        return acc;
      }, {} as CompositeRoles);
  }
}

export function buildRolesInclusion(resource: Constructor<Entity> | Entity, roles: CompositeRoles): Inclusion[] {
  const resourceCls = (typeof resource === 'function' ? resource : resource.constructor) as typeof Entity;
  const {$, ...relRoles} = roles;
  if (isEmpty(relRoles)) {
    return [];
  }
  const inclusions: Inclusion[] = [];
  for (const rel of Object.keys(relRoles)) {
    const items = relRoles[rel];
    if (items.length === 0) {
      continue;
    }

    buildInclusion(inclusions, rel, resourceCls);
  }

  return inclusions;

  function buildInclusion(inclusions: Inclusion[], key: string, model: typeof Entity) {
    const parts = key.split('.');
    const rel = model.definition.relations[parts[0]];
    if (!rel) {
      throw new Error(`${model.name} has no relation ${key}`);
    }
    let inclusion = inclusions.find(i => i.relation === parts[0]);
    if (!inclusion) {
      inclusion = {relation: parts[0], scope: {fields: [...model.getIdProperties()]}};
      inclusions.push(inclusion);
    }
    if (parts.length > 1) {
      const include = (inclusion.scope!.include = inclusion.scope!.include ?? []) as Inclusion[];
      buildInclusion(include, parts.slice(1).join('.'), rel.target());
    }
  }
}
