import {isClass} from '@bleco/boot';
import {AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer} from '@loopback/authorization';
import {Entity} from '@loopback/repository';

import {AclBindings} from '../keys';

export function createResourceResolver(resourceOrClass: typeof Entity | Entity, idIndex = 0): Authorizer {
  let resource: Entity;
  let EntityClass: typeof Entity;
  if (!isClass(resourceOrClass)) {
    resource = resourceOrClass;
  } else {
    EntityClass = resourceOrClass;
  }

  return async (authorizationCtx: AuthorizationContext, _metadata: AuthorizationMetadata) => {
    if (!resource) {
      const resourceIdName = EntityClass.getIdProperties()[0];
      if (!resourceIdName) {
        throw new Error(`Resource ${EntityClass.name} has no id property`);
      }
      const id = authorizationCtx.invocationContext.args[idIndex];
      resource = new EntityClass({
        [resourceIdName]: id,
      });
    }
    authorizationCtx.invocationContext.bind(AclBindings.RESOURCE).to(resource);
    return AuthorizationDecision.ABSTAIN;
  };
}
