import {Context} from '@loopback/context';
import {Entity} from '@loopback/repository';
import {Class} from 'tily/typings/types';
import {Policy} from './policy';
import {AclBindings} from './keys';

export function getPolicy(context: Context, model: Class<Entity> | string): Promise<Policy> {
  const name = typeof model === 'string' ? model : model.name;
  return context.get<Policy>(`${AclBindings.POLICIES}.${name}`);
}

export function resourcePolymorphic(resource: Entity): { resourceId: string, resourceType: string } {
  return {
    resourceId: resource.getId(),
    resourceType: resource.constructor.name,
  }
}
