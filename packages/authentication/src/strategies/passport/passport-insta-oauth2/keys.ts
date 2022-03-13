import {BindingKey} from '@loopback/core';
import {StrategyOption, StrategyOptionWithRequest} from 'passport-instagram';

export namespace InstagramAuthBindings {
  export const Config = BindingKey.create<StrategyOption | StrategyOptionWithRequest>(
    'eco.authentication.config.instagram',
  );
}
