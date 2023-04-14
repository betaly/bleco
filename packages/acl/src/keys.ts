import {RepositoryFactory} from '@bleco/repo';
import {Authorizer} from '@loopback/authorization';
import {BindingKey} from '@loopback/context';
import {Entity} from '@loopback/repository';

import {Acl} from './acl';
import {Enforcer} from './enforcer';
import {DefaultEnforcerOptions} from './enforcers/default';
import {PolicyRegistry} from './policies';
import {AclRoleMappingService, AclRoleService} from './services';
import {PrincipalResolver} from './types';

export namespace AclBindings {
  /**
   * Namespace for policy bindings
   */
  export const POLICIES = 'policies';

  export const ENFORCER = BindingKey.create<Enforcer>('acl.enforcer');
  export const ACL = BindingKey.create<Acl>('acl.acl');

  export const REPOSITORY_FACTORY = BindingKey.create<RepositoryFactory>('acl.repositoryFactory');

  export const POLICY_REGISTRY = BindingKey.create<PolicyRegistry>('acl.policyRegistry');

  export const ROLE_SERVICE = BindingKey.create<AclRoleService>('acl.services.role');
  export const ROLE_MAPPING_SERVICE = BindingKey.create<AclRoleMappingService>('acl.services.roleMapping');

  export const PRINCIPAL_RESOLVER = BindingKey.create<PrincipalResolver>('acl.principalResolver');

  export const AUTHORIZER = BindingKey.create<Authorizer>('acl.authorization.authorizer');

  export const RESOURCE = BindingKey.create<Entity>('acl.authorization.resource');

  export const DEFAULT_ENFORCER_OPTIONS = BindingKey.create<DefaultEnforcerOptions>('acl.enforcer.default.options');
}

export namespace AclTags {
  export const POLICY = 'policy';
}
