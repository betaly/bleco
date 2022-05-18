import {BindingKey} from '@loopback/context';
import {Enforcer} from './enforcer';
import {DomainLike} from './types';
import {PolicyManager} from './policy.manager';

export namespace AclBindings {
  /**
   * Namespace for policy bindings
   */
  export const POLICIES = 'policies';

  export const POLICY_MANAGER = BindingKey.create<PolicyManager>('acl.PolicyManager');

  export const DOMAIN = BindingKey.create<DomainLike>('acl.domain');

  export const ENFORCER = BindingKey.create<Enforcer>('acl.enforcer');

  export const SERVICE = BindingKey.create<Enforcer>('services.AclService');
}

export namespace AclTags {
  export const POLICY = 'policy';
}
