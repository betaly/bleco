import {BindingScope, inject, injectable, Provider} from '@loopback/context';
import {Store} from 'kvs';
import {OidpBindings} from '../keys';
import {OidcProviderFactory} from '../oidc/oidc-provider-factory';
import {OidcAdapterFactory, OidcDefaultPath, OidcFindAccount, OidcProvider, OidpConfig} from '../types';

@injectable({scope: BindingScope.SINGLETON})
export class OidcProviderProvider implements Provider<OidcProvider> {
  private readonly factory: OidcProviderFactory;
  constructor(
    @inject(OidpBindings.CONFIG)
    config?: OidpConfig,
    @inject(OidpBindings.FIND_ACCOUNT, {optional: true})
    findAccount?: OidcFindAccount,
    @inject(OidpBindings.ADAPTER_FACTORY, {optional: true})
    adapterFactory?: OidcAdapterFactory,
  ) {
    const oidcConfig = config?.oidc ?? {};
    const baseUrl = config?.baseUrl ?? '/';
    const oidcPath = config?.path ?? OidcDefaultPath;
    const storeOptions = config?.store ?? {name: 'memory'};
    this.factory = new OidcProviderFactory(oidcConfig, {
      baseUrl,
      oidcPath,
      findAccount,
      adapterFactory,
      store: Store.create(storeOptions),
    });
  }

  value(): Promise<OidcProvider> {
    return this.factory.createProvider();
  }
}
