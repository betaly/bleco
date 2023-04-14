# @bleco/aliaser

> A loopback next bindings alias helper

## Motive

Loopback has a great configuration management mechanism. But it is not responsible for external loading. A typical
loading method is to load from environment variables. However, it caused some troubles in the default settings and
annoying empty checking during the development period.

`@bleco/aliaser` allow you using loopback [toAlias](https://loopback.io/doc/en/lb4/apidocs.context.binding.toalias.html)
to alias config bindings from `app.options` - `CoreBindings.APPLICATION_CONFIG`.

## Installation

npm

```shell
npm i @bleco/aliaser
```

yarn

```shell
yarn add @bleco/aliaser
```

## Usage

Steps:

- Define an aliaser

```typescript
// keys.ts
import {Aliaser} from '@bleco/aliser';

namespace SomeBinding {
  export const Config = BindingKey.create('some.key');
}

// Define an aliser
const ConfigAliser = Aliaser.create({
  auth: SomeBinding.Config,
});
```

- Alias in component constructor

```typescript
import {Application, CoreBindings} from '@loopback/core';

import {ConfigAliser} from '../keys';

class SomeComponent {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,
  ) {
    // it will alias `SomeBinding.Config` from `app.options.auth`
    ConfigAliser.alias(app);
  }
}
```

- Use `@inject(SomeBinding.Config)` or `app.get(SomeBinding.Config)` to get config object in loopback way
  - `@inject(SomeBinding.Config)`

```typescript
class SomeClass {
  someMethod(
    @inject(SomeBinding.Config)
    config: SomeConfig,
  ) {
    //...
  }
}
```

- `app.get(SomeBinding.Config)`

```typescript
const config = await app.get(SomeBinding.Config);
```
