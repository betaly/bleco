import {BindingKey} from '@loopback/core';
import * as PassportLocal from 'passport-local';

export namespace LocalAuthBindings {
  export const Config = BindingKey.create<PassportLocal.IStrategyOptions | PassportLocal.IStrategyOptionsWithRequest>(
    'eco.authentication.config.local',
  );
}
