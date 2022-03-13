import {BindingKey} from '@loopback/core';
import {StrategyOptions, StrategyOptionsWithRequest} from 'passport-google-oauth20';

export namespace GoogleAuthBindings {
  export const Config = BindingKey.create<StrategyOptions | StrategyOptionsWithRequest>(
    'eco.authentication.config.google',
  );
}
