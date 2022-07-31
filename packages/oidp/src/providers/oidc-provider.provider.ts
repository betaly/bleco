import {BindingScope, inject, injectable, Provider} from '@loopback/context';
import {Store} from 'kvs';
import {OidpBindings} from '../keys';
import {OidcProviderFactory} from '../oidc/oidc-provider-factory';
import {AdapterFactory, FindAccount, LoadExistingGrant, OidcDefaultPath, OidcProvider, OidpConfig} from '../types';

@injectable({scope: BindingScope.SINGLETON})
export class OidcProviderProvider implements Provider<OidcProvider> {
  private readonly factory: OidcProviderFactory;
  constructor(
    @inject(OidpBindings.CONFIG)
    config?: OidpConfig,
    @inject(OidpBindings.ADAPTER_FACTORY, {optional: true})
    adapterFactory?: AdapterFactory,
    @inject(OidpBindings.FIND_ACCOUNT, {optional: true})
    findAccount?: FindAccount,
    @inject(OidpBindings.LOAD_EXISTING_GRANT, {optional: true})
    loadExistingGrant?: LoadExistingGrant,
  ) {
    const oidcConfig = config?.oidc ?? {};
    const baseUrl = config?.baseUrl ?? '/';
    const oidcPath = config?.path ?? OidcDefaultPath;
    const storeOptions = config?.store ?? {name: 'memory'};
    this.factory = new OidcProviderFactory(oidcConfig, {
      baseUrl,
      oidcPath,
      adapterFactory,
      findAccount,
      loadExistingGrant,
      store: Store.create(storeOptions),
    });
  }

  value(): Promise<OidcProvider> {
    return this.factory.createProvider();
  }
}
