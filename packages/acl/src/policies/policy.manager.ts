import {Policy} from './policy';
import {EntityClass} from '@bleco/query';
import {Role, RoleMapping} from '../models';

export class PolicyManager {
  protected policyMap = new Map<string, Policy>();

  get policies() {
    return [...this.policyMap.values()];
  }

  add(policy: Policy) {
    if (policy.type === 'principal') {
      this.defineRolesRelationOnPrincipal(policy.model);
    } else if (policy.type === 'resource') {
      this.defineRolesRelationOnResource(policy.model);
    } else {
      throw new Error(`Invalid policy type ${policy.type}`);
    }
    this.policyMap.set(policy.model.name, policy);
  }

  has(name: string) {
    return this.policyMap.has(name);
  }

  find(name: string) {
    return this.policyMap.get(name);
  }

  get(name: string) {
    const policy = this.find(name);
    if (!policy) {
      throw new Error(`Policy ${name} not found`);
    }
    return policy;
  }

  protected defineRolesRelationOnPrincipal(principalClass: EntityClass) {
    const definition = principalClass.definition;
    const rel = definition.relations['roles'];
    if (rel) {
      if (rel.target() === RoleMapping) {
        return;
      }
      throw new Error(`${principalClass.name} has a relation to ${rel.target().name} but it is not AclRoleActor`);
    }
    definition.hasMany('roles', {
      source: principalClass,
      target: () => RoleMapping,
      keyTo: 'principalId',
    });
  }

  protected defineRolesRelationOnResource(resourceClass: EntityClass) {
    const definition = resourceClass.definition;
    let rel = definition.relations['roles'];
    if (rel) {
      if (rel.target() === Role) {
        return;
      }
      throw new Error(`${resourceClass.name} has a relation to ${rel.target().name} but it is not Role`);
    }
    definition.hasMany('roles', {
      source: resourceClass,
      target: () => Role,
      keyTo: 'resourceId',
    });

    rel = definition.relations['principals'];
    if (rel) {
      if (rel.target() === RoleMapping) {
        return;
      }
      throw new Error(`${resourceClass.name} has a relation to ${rel.target().name} but it is not RoleMapping`);
    }
    definition.hasMany('principals', {
      source: resourceClass,
      target: () => RoleMapping,
      keyTo: 'resourceId',
    });
  }
}
