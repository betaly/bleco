import {config, inject} from '@loopback/context';
import {Component, CoreBindings, ProviderMap} from '@loopback/core';
import {Class, Model, Repository} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ConfigAliaser} from './aliser';
import {OidpBindings} from './keys';
import {OidcItem} from './models';
import {createRouter} from './oidp.router';
import {DbAdapterFactoryProvider, InteractionProvider, OidcProviderProvider} from './providers';
import {OidcRepository} from './repositories';
import {OidcDefaultPath, OidpConfig} from './types';

export type OidpComponentConfig = {
  enableDbAdapter: boolean;
};

export class OidpComponent implements Component {
  providers: ProviderMap;

  models: Class<Model>[];

  repositories: Class<Repository<Model>>[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: RestApplication,
    @config()
    componentConfig?: OidpComponentConfig,
  ) {
    componentConfig = {
      enableDbAdapter: true,
      ...componentConfig,
    };

    ConfigAliaser.alias(app);

    this.providers = {
      [OidpBindings.PROVIDER.key]: OidcProviderProvider,
      [OidpBindings.INTERACTION.key]: InteractionProvider,
    };

    if (componentConfig.enableDbAdapter) {
      this.models = [OidcItem];
      this.repositories = [OidcRepository];
      this.providers[OidpBindings.ADAPTER_FACTORY.key] = DbAdapterFactoryProvider;
    }

    const oidpConfig = app.getSync<OidpConfig>(OidpBindings.CONFIG);
    app.expressMiddleware('middleware.express.oidc', createRouter({basePath: oidpConfig?.path ?? OidcDefaultPath}));
  }
}
