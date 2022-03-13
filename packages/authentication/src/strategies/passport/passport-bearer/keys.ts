import {BindingKey} from '@loopback/core';
import * as PassportBearer from 'passport-http-bearer';

export namespace BearerAuthBindings {
  export const Config = BindingKey.create<PassportBearer.IStrategyOptions>('eco.authentication.config.bearer');
}
