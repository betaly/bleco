import {inject, injectable} from '@loopback/context';
import {AclBindings} from '../keys';
import {AuthorizedFilter, Enforcer, EnforcerStrategy} from '../enforcer';
import {Entity} from '@loopback/repository';
import {Class} from 'tily/typings/types';
import {BindingScope} from '@loopback/core';

@injectable({scope: BindingScope.SINGLETON})
export class EnforcerService implements Enforcer {
  constructor(
    @inject(AclBindings.ENFORCER_STRATEGY)
    private readonly strategy: EnforcerStrategy,
  ) {}

  isAllowed(principal: Entity, action: string, resource: Entity): Promise<boolean> {
    return this.strategy.isAllowed(principal, action, resource);
  }

  authorize(
    principal: Entity,
    action: string,
    resource: Entity,
    options?: {checkRead?: boolean | undefined},
  ): Promise<void> {
    return this.strategy.authorize(principal, action, resource, options);
  }

  authorizedActions(
    principal: Entity,
    resource: Entity,
    options?: {allowWildcard?: boolean | undefined},
  ): Promise<Set<string>> {
    return this.strategy.authorizedActions(principal, resource, options);
  }

  authorizeField(principal: Entity, action: string, resource: Entity, field: string): Promise<void> {
    return this.strategy.authorizeField(principal, action, resource, field);
  }

  authorizedFields(
    principal: Entity,
    action: string,
    resource: Entity,
    options?: {allowWildcard?: boolean | undefined},
  ): Promise<Set<string>> {
    return this.strategy.authorizedFields(principal, action, resource, options);
  }

  authorizedQuery(principal: Entity, action: string, resourceCls: Class<Entity>): Promise<AuthorizedFilter> {
    return this.strategy.authorizedQuery(principal, action, resourceCls);
  }

  authorizedResources(principal: Entity, action: string, resourceCls: Class<Entity>): Promise<Entity[]> {
    return this.strategy.authorizedResources(principal, action, resourceCls);
  }
}
