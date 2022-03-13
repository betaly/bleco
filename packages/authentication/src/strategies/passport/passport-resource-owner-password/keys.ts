import {BindingKey} from '@loopback/core';
import {Oauth2ResourceOwnerPassword} from './oauth2-resource-owner-password-grant';

export namespace ResourceOwnerPasswordAuthBindings {
  export const Config = BindingKey.create<Oauth2ResourceOwnerPassword.StrategyOptionsWithRequest>(
    'eco.authentication.config.resource-owner-password',
  );
}
