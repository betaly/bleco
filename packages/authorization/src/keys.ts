import {BindingKey} from '@loopback/context';
import {MetadataAccessor} from '@loopback/metadata';
import {
  AuthorizationMetadata,
  AuthorizationOptions,
  AuthorizeFn,
  CasbinAuthorizeFn,
  CasbinEnforcerConfigGetterFn,
  CasbinResourceModifierFn,
  UserPermissionsFn,
} from './types';

/**
 * Binding keys used by this component.
 */
export namespace AuthorizationBindings {
  export const AUTHORIZE_ACTION = BindingKey.create<AuthorizeFn>('eco.userAuthorization.actions.authorize');

  export const CASBIN_AUTHORIZE_ACTION = BindingKey.create<CasbinAuthorizeFn>(
    'eco.userAuthorization.actions.casbin.authorize',
  );

  export const METADATA = BindingKey.create<AuthorizationMetadata | undefined>(
    'eco.userAuthorization.operationMetadata',
  );

  export const USER_PERMISSIONS = BindingKey.create<UserPermissionsFn<string>>(
    'eco.userAuthorization.actions.userPermissions',
  );

  export const CASBIN_ENFORCER_CONFIG_GETTER = BindingKey.create<CasbinEnforcerConfigGetterFn>(
    'eco.userAuthorization.actions.casbin.config',
  );

  export const CASBIN_RESOURCE_MODIFIER_FN = BindingKey.create<CasbinResourceModifierFn>(
    'eco.userAuthorization.actions.casbin.resourceModifier',
  );

  export const OPTIONS = BindingKey.create<AuthorizationOptions>('eco.userAuthorization.options');

  export const PATHS_TO_ALLOW_ALWAYS = 'eco.userAuthorization.allowAlways';
}

export const AUTHORIZATION_METADATA_ACCESSOR = MetadataAccessor.create<AuthorizationMetadata, MethodDecorator>(
  'eco.userAuthorization.accessor.operationMetadata',
);
