import {BindingKey} from '@loopback/context';
import {Enforcer} from './enforcer';

export namespace AclBindings {
  /**
   * Namespace for policy bindings
   */
  export const POLICIES = 'policies';

  export const ENFORCER = BindingKey.create<Enforcer>('acl.enforcer');

  export const SERVICE = BindingKey.create<Enforcer>('services.AclService');
}

export namespace AclTags {
  export const POLICY = 'policy';
}
