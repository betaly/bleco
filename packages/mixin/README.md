# @bleco/mixin

> A more compatible mixin library

## The Problem

TypeScript has a [mixin pattern](https://www.typescriptlang.org/docs/handbook/mixins.html).
[But it does not support base class expressions reference class type parameters](https://github.com/microsoft/TypeScript/issues/26542).
Sometimes, [we need to use a mixin with a base class expression reference class type parameters](#Usage).

TypeScript supports mixin class with
[decorator](https://www.typescriptlang.org/docs/handbook/decorators.html#class-decorators). This allows an alternative
implementation for mixins that require base class expressions to reference class type parameters. We can use a decorator
to apply a mixin to a class.

## Installation

npm:

```shell
npm i @bleco/mixin
```

yarn:

```shell
yarn add @bleco/mixin
```

## Usage

```ts
// respository.ts
export class Repository<T extends object, ID> {
  find(): T[] {
    throw new Error('Method not implemented.');
  }

  findById(id: ID): T {
    throw new Error('Method not implemented.');
  }
}
```

Define a Mixin:

```ts
// foo.mixin.ts
import {Repository} from './repository';

export interface Foo<T extends object, ID> {
  message: string;

  foo(): string;
}

export function FooMixin<T extends object, ID, R extends MixinTarget<Constructor<Repository<T, ID>>>>(superClass: R) {
  return class extends superClass implements Foo<T, ID> {
    message = 'foo';

    foo() {
      return 'foo';
    }
  };
}
```

`@mixin` `MyRepository` with `FooMixin`:

```ts
// my-repository.ts
import {mixin} from '@bleco/mixin';

import {FooMixin} from './foo.mixin';
import {Repository} from './repository';

@mixin(FooMixin)
export class MyRepository<T extends object, ID> extends Repository<T, ID> {}

export interface MyRepository<T extends object, ID> extends Foo<T, ID> {}
```

## License

[MIT](LICENSE)
