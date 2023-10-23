# @bleco/aliaser

The `@bleco/aliaser` package provides a flexible and powerful utility for managing binding aliases within a LoopBack
application. This package enables you to define and apply aliases to bindings, allowing for more modular and
maintainable code. It is particularly useful when you want to redirect or transform values from one binding to another.

## Features

- **Simple API**: Easy to use functions for defining and applying aliases.
- **Validation and Transformation**: Built-in support for validation and transformation of aliased values.
- **Promise Support**: Asynchronous operations are fully supported, allowing for promise-based validation and
  transformation.
- **High Test Coverage**: The package is fully tested to ensure reliability and stability.

## Installation

Install the package using npm or yarn:

```bash
npm install @bleco/aliaser
# OR
yarn add @bleco/aliaser
```

## Usage

Below is a basic example of how to use `@bleco/aliaser`:

```typescript
import { Aliaser, Context, BindingKey } from '@bleco/aliaser';

// Create a new LoopBack context
const context = new Context();

// Define some bindings
context.bind('config').to({ prop: 'value' });

// Create an aliaser instance
const aliaser = Aliaser.create({ prop: 'config#prop' });

// Apply the aliases to the context
aliaser.bind(context);

// Retrieve the aliased value
const value = context.getSync('prop');  // Output: 'value'
```

In this example, we have a LoopBack context with a binding named `config` that holds an object with a property `prop`.
We create an `Aliaser` instance and define an alias from `prop` to `config#prop`. Finally, we apply the aliases to the
context and retrieve the aliased value.

## API

### `Aliaser`

The main class for defining and applying aliases.

#### `constructor()`

Creates a new `Aliaser` instance.

#### `static create(definition: AliasingDefinition): Aliaser`

Creates a new `Aliaser` instance with the given aliasing definition.

#### `add(definition: AliasingDefinition): Aliaser`

Adds an aliasing definition.

#### `bind(context: Context, options?: AliasingBindOptions): this`

Applies the defined aliases to the given LoopBack context.

### `AliasingDefinition`

An object representing the aliasing definition.

### `AliasingBindOptions`

An optional configuration object for binding options.

## Contributing

Contributions are welcome! Please submit an issue or pull request with any improvements or bug fixes.

## License

This package is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
