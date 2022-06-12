import {EntityClass} from '@bleco/query';
import {Entity} from '@loopback/repository';
import debugFactory from 'debug';
import {Constructor} from 'tily/typings/types';
import {AclRole, AclRoleMapping} from '../models';
import {Policy} from './policy';
import {AclModelRelationKeys} from './types';
import ResourceRoleMappings = AclModelRelationKeys.ResourceRoleMappings;
import ResourceRoles = AclModelRelationKeys.ResourceRoles;
import PrincipalRoleMappings = AclModelRelationKeys.PrincipalRoleMappings;

const debug = debugFactory('bleco:acl:policy-registry');

export class PolicyRegistry {
  protected policiesMap: Map<string, Policy> = new Map();

  get policies() {
    return Array.from(this.policiesMap.values());
  }

  add(policy: Policy) {
    debug('Adding policy', policy.name);
    if (policy.model) {
      switch (policy.type) {
        case 'principal':
          this.defineRolesRelationOnPrincipal(policy.model);
          // this.definePrincipalRelationOnRoleMapping(policy.model);
          break;
        case 'resource':
          this.defineRolesRelationOnResource(policy.model);
          // this.defineResourceRelationOnRoleMapping(policy.model);
          break;
        default:
          throw new Error(`Invalid policy type ${policy.type}`);
      }
    }
    this.policiesMap.set(policy.name, policy);
  }

  has(name: string | Constructor | object) {
    return this.policiesMap.has(resolveModelName(name));
  }

  find(name: string | Constructor | object) {
    return this.policiesMap.get(resolveModelName(name));
  }

  get(name: string | Constructor | object) {
    const n = resolveModelName(name);
    const policy = this.find(n);
    if (!policy) {
      throw new Error(`Policy ${n} not found`);
    }
    return policy;
  }

  protected defineRolesRelationOnPrincipal(principalCls: EntityClass) {
    checkHaveDefinitionInEntityClass(principalCls);
    const definition = principalCls.definition;
    const rel = definition.relations[PrincipalRoleMappings];
    if (rel) {
      if (rel.target() === AclRoleMapping) {
        return;
      }
      throw new Error(`${principalCls.name} has a relation to ${rel.target().name} but it is not AclRoleActor`);
    }
    definition.hasMany(PrincipalRoleMappings, {
      source: principalCls,
      target: () => AclRoleMapping,
      keyTo: 'principalId',
    });
  }

  protected defineRolesRelationOnResource(resourceCls: EntityClass) {
    checkHaveDefinitionInEntityClass(resourceCls);
    const definition = resourceCls.definition;
    let rel = definition.relations[ResourceRoles];
    if (rel) {
      if (rel.target() === AclRole) {
        return;
      }
      throw new Error(`${resourceCls.name} has a relation to ${rel.target().name} but it is not Role`);
    }
    definition.hasMany(ResourceRoles, {
      source: resourceCls,
      target: () => AclRole,
      keyTo: 'resourceId',
    });

    rel = definition.relations[ResourceRoleMappings];
    if (rel) {
      if (rel.target() === AclRoleMapping) {
        return;
      }
      throw new Error(`${resourceCls.name} has a relation to ${rel.target().name} but it is not RoleMapping`);
    }
    definition.hasMany(ResourceRoleMappings, {
      source: resourceCls,
      target: () => AclRoleMapping,
      keyTo: 'resourceId',
    });
  }
}

export function resolveModelName(name: string | Constructor | object): string {
  if (typeof name === 'string') {
    return name;
  } else if (typeof name !== 'function') {
    name = name.constructor;
  }
  return (name as typeof Entity).modelName ?? (name as Constructor).name;
}

export function checkHaveDefinitionInEntityClass(cls: typeof Entity) {
  if (!cls.definition) {
    throw new Error(`${cls.name} has no definition. Maybe you forgot to add decorator @model()?`);
  }
}
