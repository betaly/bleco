import {BindingKey} from '@loopback/core';
import {StrategyOptionWithRequest} from 'passport-facebook';
import {ExtendedStrategyOption} from './types';

export namespace FacebookAuthBindings {
  export const Config = BindingKey.create<ExtendedStrategyOption | StrategyOptionWithRequest>(
    'eco.authentication.config.facebook',
  );
}
