import {Application, Binding, Component, CoreBindings, inject, ProviderMap} from '@loopback/core';
import {VaultSecurityBindings} from './keys';
import {VaultConnectProvider} from './services';
import {ConfigAliaser} from './alias';

export class VaultComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private app: Application,
  ) {
    ConfigAliaser.alias(app);

    this.providers = {
      [VaultSecurityBindings.VAULT_CONNECTOR.key]: VaultConnectProvider,
    };
    // this.bindings.push(Binding.bind(VaultSecurityBindings.CONFIG.key).to(null));
  }

  providers?: ProviderMap;
  bindings: Binding[] = [];
}
