import {BindingKey} from '@loopback/core';
import {AuthenticateOptions, AuthenticateOptionsWithRequest} from 'passport-apple';

export namespace AppleAuthBindings {
  export const Config = BindingKey.create<AuthenticateOptions | AuthenticateOptionsWithRequest>(
    'eco.authentication.config.apple',
  );
}
