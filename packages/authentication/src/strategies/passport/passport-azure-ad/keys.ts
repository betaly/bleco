import {BindingKey} from '@loopback/core';
import {IOIDCStrategyOptionWithoutRequest, IOIDCStrategyOptionWithRequest} from 'passport-azure-ad';

export namespace AzureAdAuthBindings {
  export const Config = BindingKey.create<IOIDCStrategyOptionWithoutRequest | IOIDCStrategyOptionWithRequest>(
    'eco.authentication.config.azuread',
  );
}
