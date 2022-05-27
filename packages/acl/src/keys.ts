import {BindingKey} from '@loopback/context';
import {EnforcerStrategy} from './enforcer';
import {PolicyManager} from './policies';
import {EnforcerService, RoleMappingService, RoleService} from './services';

export namespace AclBindings {
  /**
   * Namespace for policy bindings
   */
  export const POLICIES = 'policies';

  export const POLICY_MANAGER = BindingKey.create<PolicyManager>('acl.PolicyManager');

  export const ENFORCER_STRATEGY = BindingKey.create<EnforcerStrategy>('acl.enforcer.strategy');

  export const ROLE_SERVICE = BindingKey.create<RoleService>('services.role');

  export const ROLE_MAPPING_SERVICE = BindingKey.create<RoleMappingService>('services.role-mapping');

  export const ENFORCER_SERVICE = BindingKey.create<EnforcerService>('services.enforcer');
}

export namespace AclTags {
  export const POLICY = 'policy';
}
