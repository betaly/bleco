import {inject, injectable} from '@loopback/context';
import {BindingScope} from '@loopback/core';
import {Entity, FilterExcludingWhere, Options} from '@loopback/repository';
import {Class} from 'tily/typings/types';

import {AuthorizedFilter, Enforcer} from './enforcer';
import {AclBindings} from './keys';

@injectable({scope: BindingScope.SINGLETON})
export class Acl implements Enforcer {
  constructor(
    @inject(AclBindings.ENFORCER)
    private readonly enforcer: Enforcer,
  ) {}

  isAllowed(principal: Entity, action: string, resource: Entity): Promise<boolean> {
    return this.enforcer.isAllowed(principal, action, resource);
  }

  authorize(
    principal: Entity,
    action: string,
    resource: Entity,
    options?: {checkRead?: boolean | undefined},
  ): Promise<void> {
    return this.enforcer.authorize(principal, action, resource, options);
  }

  authorizedActions(
    principal: Entity,
    resource: Entity,
    options?: {allowWildcard?: boolean | undefined},
  ): Promise<Set<string>> {
    return this.enforcer.authorizedActions(principal, resource, options);
  }

  authorizeField(principal: Entity, action: string, resource: Entity, field: string): Promise<void> {
    return this.enforcer.authorizeField(principal, action, resource, field);
  }

  authorizedFields(
    principal: Entity,
    action: string,
    resource: Entity,
    options?: {allowWildcard?: boolean | undefined},
  ): Promise<Set<string>> {
    return this.enforcer.authorizedFields(principal, action, resource, options);
  }

  authorizedQuery(principal: Entity, action: string, resourceCls: Class<Entity>): Promise<AuthorizedFilter> {
    return this.enforcer.authorizedQuery(principal, action, resourceCls);
  }

  authorizedResources<T extends Entity>(
    principal: Entity,
    action: string,
    resourceCls: Class<T>,
    filter?: FilterExcludingWhere<T>,
    options?: Options,
  ): Promise<T[]> {
    return this.enforcer.authorizedResources(principal, action, resourceCls, filter, options);
  }
}
