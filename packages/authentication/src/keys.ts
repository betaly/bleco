import {BindingKey, Constructor} from '@loopback/context';
import {MetadataAccessor} from '@loopback/metadata';
import {Strategy} from 'passport';

import {
  AuthenticateFn,
  AuthenticationConfig,
  AuthenticationMetadata,
  EntityWithIdentifier,
  IAuthClient,
  IAuthUser,
} from './types';

export * from './strategies/keys';

/**
 * Binding keys used by this component.
 */
export namespace AuthenticationBindings {
  export const USER_STRATEGY = BindingKey.create<Strategy | undefined>('bleco.userAuthentication.strategy');

  export const CLIENT_STRATEGY = BindingKey.create<Strategy | undefined>('bleco.clientAuthentication.strategy');

  export const USER_AUTH_ACTION = BindingKey.create<AuthenticateFn<IAuthUser | undefined>>(
    'bleco.userAuthentication.actions.authenticate',
  );

  export const CLIENT_AUTH_ACTION = BindingKey.create<AuthenticateFn<IAuthClient | undefined>>(
    'bleco.clientAuthentication.actions.authenticate',
  );

  export const USER_METADATA = BindingKey.create<AuthenticationMetadata | undefined>(
    'bleco.userAuthentication.operationMetadata',
  );

  export const CLIENT_METADATA = BindingKey.create<AuthenticationMetadata | undefined>(
    'bleco.clientAuthentication.operationMetadata',
  );

  export const CURRENT_USER = BindingKey.create<IAuthUser | undefined>('bleco.userAuthentication.currentUser');

  export const CURRENT_CLIENT = BindingKey.create<IAuthClient | undefined>('bleco.clientAuthentication.currentClient');

  export const CONFIG = BindingKey.create<AuthenticationConfig>('bleco.userAuthentication.config');

  export const USER_MODEL = BindingKey.create<Constructor<EntityWithIdentifier>>('bleco.userAuthentication.userModel');
}

export const USER_AUTHENTICATION_METADATA_KEY = MetadataAccessor.create<AuthenticationMetadata, MethodDecorator>(
  'userAuthentication.operationsMetadata',
);

export const CLIENT_AUTHENTICATION_METADATA_KEY = MetadataAccessor.create<AuthenticationMetadata, MethodDecorator>(
  'clientAuthentication.operationsMetadata',
);
