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
  export const AUTHORIZE_ACTION = BindingKey.create<AuthorizeFn>('bleco.userAuthorization.actions.authorize');

  export const CASBIN_AUTHORIZE_ACTION = BindingKey.create<CasbinAuthorizeFn>(
    'bleco.userAuthorization.actions.casbin.authorize',
  );

  export const METADATA = BindingKey.create<AuthorizationMetadata | undefined>(
    'bleco.userAuthorization.operationMetadata',
  );

  export const USER_PERMISSIONS = BindingKey.create<UserPermissionsFn<string>>(
    'bleco.userAuthorization.actions.userPermissions',
  );

  export const CASBIN_ENFORCER_CONFIG_GETTER = BindingKey.create<CasbinEnforcerConfigGetterFn>(
    'bleco.userAuthorization.actions.casbin.config',
  );

  export const CASBIN_RESOURCE_MODIFIER_FN = BindingKey.create<CasbinResourceModifierFn>(
    'bleco.userAuthorization.actions.casbin.resourceModifier',
  );

  export const OPTIONS = BindingKey.create<AuthorizationOptions>('bleco.userAuthorization.options');

  export const PATHS_TO_ALLOW_ALWAYS = 'bleco.userAuthorization.allowAlways';
}

export const AUTHORIZATION_METADATA_ACCESSOR = MetadataAccessor.create<AuthorizationMetadata, MethodDecorator>(
  'bleco.userAuthorization.accessor.operationMetadata',
);
