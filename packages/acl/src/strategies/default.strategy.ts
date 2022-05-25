import {Class} from 'tily/typings/types';
import {Entity} from '@loopback/repository';
import {AuthorizedFilter, EnforcerStrategy} from '../enforcer';
import {BindingScope, injectable} from '@loopback/context';

@injectable({scope: BindingScope.SINGLETON})
export class DefaultEnhancerStrategy implements EnforcerStrategy {
  name = 'default';

  constructor() {}

  isAllowed(principal: Entity, action: string, resource: Entity): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  authorize(principal: Entity, action: string, resource: Entity, options?: {checkRead?: boolean}): Promise<void> {
    throw new Error('Method not implemented.');
  }

  authorizedActions(
    principal: Entity,
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

  authorizeField(principal: Entity, action: string, resource: Entity, field: string): Promise<void> {
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
}
