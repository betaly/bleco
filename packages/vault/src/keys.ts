import {BindingKey} from '@loopback/core';
import {VaultConnector} from './services/vault-connector';
import {VaultProviderOptions} from './types';

export namespace VaultSecurityBindings {
  export const VAULT_CONNECTOR = BindingKey.create<VaultConnector>('bleco.security.vault.connect');

  export const CONFIG = BindingKey.create<VaultProviderOptions | null>('bleco.security.vault.config');
}
