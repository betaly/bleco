/* eslint-disable @typescript-eslint/no-explicit-any */

import {Entity} from '@loopback/repository';
import {
  DomainLike,
  EntityLike,
  PrincipalPolymorphic,
  PrincipalPolymorphicOrEntity,
  ResourcePolymorphic,
  ResourcePolymorphicOrEntity,
} from './types';

export function toPrincipalPolymorphic(principal: PrincipalPolymorphicOrEntity): PrincipalPolymorphic {
  if (isPrincipalPolymorphic(principal)) {
    return principal;
  }
  return {
    principalType: principal.constructor.name,
    principalId: principal.getId(),
  };
}

export function toResourcePolymorphic(resource: ResourcePolymorphicOrEntity): ResourcePolymorphic {
  if (isResourcePolymorphic(resource)) {
    return resource;
  }
  return {
    resourceType: resource.constructor.name,
    resourceId: resource.getId(),
  };
}

export function resolveRoleId(role: EntityLike | string): string {
  if (typeof role === 'string') {
    return role;
  } else if (role instanceof Entity) {
    return role.getId();
  } else if (role && 'id' in role) {
    return role.id.toString();
  }
  throw new Error('Invalid role parameter: ' + role);
}

export function resolveDomain(domain?: DomainLike | string): string | undefined {
  if (typeof domain === 'string') {
    return domain;
  } else if (isEntity(domain)) {
    return domain.getId().toString();
  } else if (domain && 'id' in domain) {
    return domain.id.toString();
  }
}

export function isEntity(x: any): x is Entity {
  return x?.getId != null && x.getIdObject != null;
}

export function isPrincipalPolymorphic(x: any): x is PrincipalPolymorphic {
  return x?.principalType != null && x.principalId != null;
}

export function isPrincipalPolymorphicOrEntity(x: any): x is PrincipalPolymorphicOrEntity {
  return isPrincipalPolymorphic(x) || isEntity(x);
}

export function isResourcePolymorphic(x: any): x is ResourcePolymorphic {
  return x?.resourceType != null && x.resourceId != null;
}

export function isResourcePolymorphicOrEntity(x: any): x is ResourcePolymorphicOrEntity {
  return isResourcePolymorphic(x) || isEntity(x);
}
