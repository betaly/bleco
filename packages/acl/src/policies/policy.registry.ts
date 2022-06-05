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
    debug('Adding policy', policy.model.name);
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
    this.policiesMap.set(policy.model.name, policy);
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

  // protected definePrincipalRelationOnRoleMapping(principalCls: EntityClass) {
  //   const definition = RoleMapping.definition;
  //   const relKey = RoleMappingPrincipal(principalCls);
  //   const rel = definition.relations[relKey];
  //   if (rel) {
  //     if (rel.target() === principalCls) {
  //       return;
  //     }
  //     throw new Error(`${principalCls.name} has a relation to ${rel.target().name} but it is not ${principalCls.name}`);
  //   }
  //   definition.hasMany(relKey, {
  //     source: RoleMapping,
  //     target: () => principalCls,
  //     keyFrom: 'principalId',
  //   });
  // }

  protected defineRolesRelationOnResource(resourceCls: EntityClass) {
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

  // protected defineResourceRelationOnRoleMapping(resourceCls: EntityClass) {
  //   const definition = RoleMapping.definition;
  //   const relKey = RoleMappingResource(resourceCls);
  //   let rel = definition.relations[relKey];
  //   if (rel) {
  //     if (rel.target() === resourceCls) {
  //       return;
  //     }
  //     throw new Error(`${RoleMapping.name} has a relation to ${rel.target().name} but it is not ${resourceCls.name}`);
  //   }
  //   definition.belongsTo(relKey, {
  //     source: RoleMapping,
  //     target: () => resourceCls,
  //     keyFrom: 'resourceId',
  //   });
  // }
}

export function resolveModelName(name: string | Constructor | object): string {
  if (typeof name === 'string') {
    return name;
  } else if (typeof name !== 'function') {
    name = name.constructor;
  }
  return (name as typeof Entity).modelName ?? (name as Constructor).name;
}
