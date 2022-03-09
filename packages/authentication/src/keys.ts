import {BindingKey} from '@loopback/context';
import {MetadataAccessor} from '@loopback/metadata';
import {Strategy} from 'passport';

import {AuthenticateFn, AuthenticationMetadata, IAuthClient, IAuthUser} from './types';

export * from './strategies/keys';

/**
 * Binding keys used by this component.
 */
export namespace AuthenticationBindings {
  export const USER_STRATEGY = BindingKey.create<Strategy | undefined>('eco.userAuthentication.strategy');

  export const CLIENT_STRATEGY = BindingKey.create<Strategy | undefined>('eco.clientAuthentication.strategy');

  export const USER_AUTH_ACTION = BindingKey.create<AuthenticateFn<IAuthUser | undefined>>(
    'eco.userAuthentication.actions.authenticate',
  );

  export const CLIENT_AUTH_ACTION = BindingKey.create<AuthenticateFn<IAuthClient | undefined>>(
    'eco.clientAuthentication.actions.authenticate',
  );

  export const USER_METADATA = BindingKey.create<AuthenticationMetadata | undefined>(
    'eco.userAuthentication.operationMetadata',
  );

  export const CLIENT_METADATA = BindingKey.create<AuthenticationMetadata | undefined>(
    'eco.clientAuthentication.operationMetadata',
  );

  export const CURRENT_USER = BindingKey.create<IAuthUser | undefined>('eco.userAuthentication.currentUser');

  export const CURRENT_CLIENT = BindingKey.create<IAuthClient | undefined>('eco.clientAuthentication.currentClient');
}

export const USER_AUTHENTICATION_METADATA_KEY = MetadataAccessor.create<AuthenticationMetadata, MethodDecorator>(
  'userAuthentication.operationsMetadata',
);

export const CLIENT_AUTHENTICATION_METADATA_KEY = MetadataAccessor.create<AuthenticationMetadata, MethodDecorator>(
  'clientAuthentication.operationsMetadata',
);
