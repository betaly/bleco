# @bleco/oidp

> A loopback 4 extension for integrating an oidc id provider

## Setup

### Configuration

`oidp` has some default configurations, but you can override it. It is aliased from `ApplicationConfig.oidp.oidc`.

#### [Clients\*](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#clients)

### [findAccount\*](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#findaccount)

[findAccount](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#findaccount) function is required.

```ts
import {OidcDataSourceName, OidpBindings, OidpComponent} from '@bleco/oidp';
import {Application} from '@loopback/core';

function setupOidp(app: Application) {
  // specify the custom FindAccount function to use in the oidc provider
  this.bind(OidpBindings.FIND_ACCOUNT).toProvider(SomeFindAccountProvider);
  app.component(OidpComponent);
}
```

### AdapterFactory

`@bleco/oidp` has a builtin adapter factory based on loopback normal repository that can be used to create an adapter
for OIDC provider.

#### Default Adapter Factory

```ts
import {OidcDataSourceName, OidpComponent} from '@bleco/oidp';
import {Application} from '@loopback/core';

function setupOidp(app: Application) {
  // specify the datasource to use in the default oidc adapter
  this.bind(`datasources.${OidcDataSourceName}`).toAlias('databases.some-oidc-database');
  app.component(OidpComponent);
}
```

#### Custom Adapter Factory

```ts
import {OidpComponent} from '@bleco/oidp';
import {Application} from '@loopback/core';

function setupOidp(app: Application) {
  app.configure(OidpBindings.COMPONENT).to({
    // disable builtin adapter factory
    enableDbAdapter: false,
  });
  // specify the custom adapter factory to use
  app.bind(OidpBindings.ADAPTER_FACTORY).toProvider(SomeOidpAdapterFactoryProvider);
  app.component(OidpComponent);
}
```

#### [Custom Client](https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#clients)

In addition to static clients oidc provider will use the adapter's `find` method when a non-static client_id is
encountered.
