import {BindingKey} from '@loopback/context';
import {EnforcerStrategy} from './enforcer';
import {DomainLike} from './types';
import {PolicyManager} from './policy.manager';
import {RoleMappingService, RoleService} from './services';

export namespace AclBindings {
  /**
   * Namespace for policy bindings
   */
  export const POLICIES = 'policies';

  export const POLICY_MANAGER = BindingKey.create<PolicyManager>('acl.PolicyManager');

  export const DOMAIN = BindingKey.create<DomainLike>('acl.domain');

  export const ROLE_SERVICE = BindingKey.create<RoleService>('services.RoleService');

  export const ROLE_MAPPING_SERVICE = BindingKey.create<RoleMappingService>('services.RoleMappingService');

  export const ENFORCER_STRATEGY = BindingKey.create<EnforcerStrategy>('acl.enforcer.strategy');

  export const ENFORCER_STRATEGY_EXTENSION_POINT_NAME = 'acl.enforcer.strategies';
}

export namespace AclTags {
  export const POLICY = 'policy';
}
