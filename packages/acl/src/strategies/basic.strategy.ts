import {Class} from 'tily/typings/types';
import {Entity} from '@loopback/repository';
import {injectable} from '@loopback/context';
import {AuthorizedFilter, EnforcerStrategy} from '../enforcer';
import {asEnhancerStrategyExtension} from '../types';

@injectable(asEnhancerStrategyExtension)
export class BasicEnhancerStrategy implements EnforcerStrategy {
  name = 'basic';

  constructor() {}

  authorize(principal: Entity, action: string, resource: Entity, options?: {checkRead?: boolean}): Promise<void> {
    throw new Error('Method not implemented.');
  }

  authorizeField(principal: Entity, action: string, resource: Entity, field: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  authorizedActions(
    principal: Entity,
    resource: Entity,
    options?: {allowWildcard?: boolean},
  ): Promise<Set<string | '*'>> {
    throw new Error('Method not implemented.');
  }

  authorizedFields(
    principal: Entity,
    action: string,
    resource: Entity,
    options?: {allowWildcard?: boolean},
  ): Promise<Set<string | '*'>> {
    throw new Error('Method not implemented.');
  }

  authorizedQuery(principal: Entity, action: string, resourceCls: Class<Entity>): Promise<AuthorizedFilter> {
    throw new Error('Method not implemented.');
  }

  authorizedResources(principal: Entity, action: string, resourceCls: Class<Entity>): Promise<Entity[]> {
    throw new Error('Method not implemented.');
  }

  isAllowed(principal: Entity, action: string, resource: Entity): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
