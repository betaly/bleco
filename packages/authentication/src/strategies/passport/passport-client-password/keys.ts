import {BindingKey} from '@loopback/core';
import * as ClientPasswordStrategy from 'passport-oauth2-client-password';

export namespace ClientPasswordAuthBindings {
  export const Config = BindingKey.create<ClientPasswordStrategy.StrategyOptionsWithRequestInterface>(
    'eco.authentication.config.client-password',
  );
}
