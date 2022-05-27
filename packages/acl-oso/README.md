# @bleco/acl-oso

> A loopback-next extension for Oso authorization integration

## Usage

`RepositoryFactory` is required. We can bind the default repository factory or a custom one.

```ts
import {DefaultRepositoryFactoryProvider} from '@bleco/repository-factory';

app
  .bind(RepositoryFactoryBindings.REPOSITORY_FACTORY_BINDINGS)
  .toProvider(DefaultRepositoryFactoryProvider)
  .inScope(BindingScope.SINGLETON);
```
