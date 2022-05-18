/* eslint-disable @typescript-eslint/no-explicit-any */

import {Entity} from '@loopback/repository';
import {DomainLike, EntityLike, ResourceParams, ResourcePolymorphic} from './types';

export const RoleIdSeparator = ':';

export function generateRoleId(roleName: string, resource: ResourceParams): string {
  const polymorphic = resource instanceof Entity ? resolveResourcePolymorphic(resource) : resource;
  return `${polymorphic.resourceType}${RoleIdSeparator}${polymorphic.resourceId}${RoleIdSeparator}${roleName}`;
}

export function isRoleId(roleId: string): boolean {
  return roleId.includes(RoleIdSeparator);
}

export function parseRoleId(roleId: string): {resourceType?: string; resourceId?: string; name: string} {
  if (isRoleId(roleId)) {
    const parts = roleId.split(RoleIdSeparator);
    const name = parts.pop()!;
    const resourceId = parts.pop();
    const resourceType = parts.pop();
    return {resourceType, resourceId, name};
  } else {
    return {name: roleId};
  }
}

export function resolveResourcePolymorphic(resource: ResourceParams): ResourcePolymorphic {
  if (isResourcePolymorphic(resource)) {
    return resource;
  }
  return {
    resourceId: resource.getId(),
    resourceType: resource.constructor.name,
  };
}

export function resolveEntityId(entityOrId: EntityLike | string | number): string {
  if (typeof entityOrId === 'string' || typeof entityOrId === 'number') {
    return entityOrId.toString();
  } else if (entityOrId instanceof Entity) {
    return entityOrId.getId();
  } else if (entityOrId && 'id' in entityOrId) {
    return entityOrId.id.toString();
  } else {
    throw new Error('Invalid entity type');
  }
}

export function resolveRoleId(role: EntityLike | string, resource?: ResourceParams): string {
  if (typeof role === 'string') {
    if (isRoleId(role)) {
      return role;
    } else {
      if (!resource) {
        throw new Error('Cannot resolve "roleId" for role without resource');
      }
      return generateRoleId(role, resource);
    }
  } else if (role instanceof Entity) {
    return role.getId();
  } else if (role && 'id' in role) {
    return role.id.toString();
  }
  throw new Error('Invalid role parameter: ' + role);
}

export function resolveDomainId(domain?: DomainLike | string): string | undefined {
  if (typeof domain === 'string') {
    return domain;
  } else if (domain instanceof Entity) {
    return domain.getId().toString();
  } else if (domain && 'id' in domain) {
    return domain.id.toString();
  }
}

export function isResourcePolymorphic(x: any): x is ResourcePolymorphic {
  return x?.resourceType != null && x.resourceId != null;
}

export function isResourceParamsLike(x: any): x is ResourceParams {
  return (x && isResourcePolymorphic(x)) || x instanceof Entity;
}
