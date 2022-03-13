import {BindingKey} from '@loopback/core';
import {Keycloak} from '../../types';

export namespace KeycloakAuthBindings {
  export const Config = BindingKey.create<Keycloak.StrategyOptions>('eco.authentication.config.keycloak');
}
