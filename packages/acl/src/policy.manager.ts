import {Policy} from './policy';
import {EntityClass} from '@bleco/query';
import {Role, RoleMapping} from './models';

export class PolicyManager {
  protected policyMap = new Map<string, Policy>();

  get policies() {
    return [...this.policyMap.values()];
  }

  add(policy: Policy) {
    if (policy.type === 'principal') {
      this.defineRoleActorsRelationOnActor(policy.model);
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

  protected defineRoleActorsRelationOnActor(actorClass: EntityClass) {
    const definition = actorClass.definition;
    const rel = definition.relations['actorRoles'];
    if (rel) {
      if (rel.target() === RoleMapping) {
        return;
      }
      throw new Error(`${actorClass.name} has a relation to ${rel.target().name} but it is not AclRoleActor`);
    }
    definition.hasMany('actorRoles', {
      source: actorClass,
      target: () => RoleMapping,
    });
  }

  protected defineRolesRelationOnResource(resourceClass: EntityClass) {
    const definition = resourceClass.definition;
    const rel = definition.relations['roles'];
    if (rel) {
      if (rel.target() === Role) {
        return;
      }
      throw new Error(`${resourceClass.name} has a relation to ${rel.target().name} but it is not Role`);
    }
    definition.hasMany('roles', {
      source: resourceClass,
      target: () => Role,
    });
  }
}