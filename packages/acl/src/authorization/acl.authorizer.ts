import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  AuthorizationTags,
  Authorizer,
} from '@loopback/authorization';
import {Provider, inject, injectable} from '@loopback/context';
import debugFactory from 'debug';

import {Acl} from '../acl';
import {AclBindings} from '../keys';
import {PrincipalResolver} from '../types';

const debug = debugFactory('bleco:acl:authorizer');

const DEFAULT_SCOPE = 'admin';

@injectable({tags: [AuthorizationTags.AUTHORIZER]})
export class AclAuthorizerProvider implements Provider<Authorizer> {
  constructor(
    @inject(AclBindings.ACL)
    private acl: Acl,
    @inject(AclBindings.PRINCIPAL_RESOLVER)
    private resolvePrincipal: PrincipalResolver,
  ) {}

  /**
   * @returns authorizeFn
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ): Promise<AuthorizationDecision> {
    debug('Authorizing...');
    const principal = await this.resolvePrincipal(authorizationCtx.invocationContext);
    debug('Principal: %O', principal);
    if (!principal) {
      debug('Access denied');
      return AuthorizationDecision.DENY;
    }

    const resource = await authorizationCtx.invocationContext.get(AclBindings.RESOURCE);
    debug('Resource: %O', resource);

    const action = metadata.scopes?.[0] ?? DEFAULT_SCOPE;
    debug('Action: %O', action);

    if (await this.acl.isAllowed(principal, action, resource)) {
      debug('Access allowed');
      return AuthorizationDecision.ALLOW;
    }
    debug('Access abstain');
    return AuthorizationDecision.ABSTAIN;
  }
}
