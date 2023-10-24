import {BindingAddress, BindingKey, BindingScope, Context, isPromiseLike, ValueFactory} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {assert} from 'tily/assert';
import {isPlainObject} from 'tily/is/plainObject';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidateFn<I = any, O = any> = (value?: I) => Promise<O> | O;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Validation<I = any, O = any> =
  | {
      parse: ValidateFn<I, O>;
    }
  | {
      validate: ValidateFn<I, O>;
    }
  | ValidateFn<I, O>;

export interface AliasingDefinition {
  [prop: string]: BindingAddress | [BindingAddress, Validation] | AliasingDefinition;
}

export interface AliasingBindOptions {
  /**
   * The binding key to resolve the aliasing definition.
   */
  from?: BindingKey<unknown>;

  /**
   * Whether or not to override existing bindings for the aliasing definition binding key
   */
  override?: boolean;

  /**
   * Whether or not to bind the aliasing definition binding key as a singleton.
   */
  singleton?: boolean;
}

export class Aliaser {
  readonly definitions: [BindingKey<unknown> | null, AliasingDefinition][] = [];

  /**
   * Create a new aliaser with the given aliasing definition.
   *
   * @param from
   * @param definition
   */
  static create(from: BindingKey<unknown>, definition: AliasingDefinition): Aliaser;
  static create(definition: AliasingDefinition): Aliaser;
  static create(fromOrMetadata: BindingKey<unknown> | AliasingDefinition, definition?: AliasingDefinition): Aliaser {
    return new Aliaser().add(fromOrMetadata as BindingKey<unknown>, definition!);
  }

  constructor() {}

  /**
   * Add the given aliasing definition.
   *
   * @param from
   * @param definition
   */
  add(from: BindingKey<unknown>, definition: AliasingDefinition): Aliaser;
  add(definition: AliasingDefinition): Aliaser;
  add(fromOrDefinition: BindingKey<unknown> | AliasingDefinition, definition?: AliasingDefinition): Aliaser {
    let from: BindingKey<unknown> | null;
    if (isBindingKey(fromOrDefinition)) {
      assert(definition, '`definition` is required');
      from = fromOrDefinition;
    } else {
      from = null;
      definition = fromOrDefinition;
    }
    this._validateDefinition(definition);
    this.definitions.push([from, definition]);
    return this;
  }

  private _validateDefinition(definition: AliasingDefinition): void {
    for (const key in definition) {
      const value = definition[key];
      if (isBindingAddress(value)) {
        // no-op
      } else if (Array.isArray(value)) {
        if (!isBindingAddress(value[0]) || !isValidation(value[1])) {
          throw new Error(`Invalid validation format for property "${key}".`);
        }
      } else if (isPlainObject(value)) {
        this._validateDefinition(value);
      } else {
        throw new Error(`Invalid value for property "${key}".`);
      }
    }
  }

  /**
   * Apply to the given context with the given definition.
   *
   */
  bind(context: Context, from: BindingKey<unknown>, options?: AliasingBindOptions): this;
  bind(context: Context, options?: AliasingBindOptions): this;
  bind(
    context: Context,
    fromOrOptions?: BindingKey<unknown> | AliasingBindOptions,
    options?: AliasingBindOptions,
  ): this {
    let from: BindingKey<unknown>;
    if (isBindingAddress(fromOrOptions)) {
      from = fromOrOptions;
    } else {
      options = fromOrOptions;
      from = options?.from ?? CoreBindings.APPLICATION_CONFIG;
    }

    this.definitions.forEach(([key, definition]) => {
      this._bind(context, key ?? from, '', definition, options ?? {});
    });
    return this;
  }

  protected _bind(
    context: Context,
    from: BindingKey<unknown>,
    prop: string,
    target: BindingAddress | [BindingAddress, Validation] | AliasingDefinition,
    options: AliasingBindOptions,
  ) {
    if (isBindingAddress(target) || Array.isArray(target)) {
      const [address, validation] = Array.isArray(target) ? target : [target, undefined];
      const key = from.deepProperty(prop);

      if (options?.override || !context.isBound(address)) {
        const binding = context.bind(address).toDynamicValue(this._resolveValue(key, validation));

        if (options.singleton || options.singleton == null) {
          binding.inScope(BindingScope.SINGLETON);
        }
      }
    } else if (isPlainObject(target)) {
      Object.entries(target).forEach(([key, value]) => {
        this._bind(context, from, [prop, key].filter(Boolean).join('.'), value, options);
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _resolveValue<I = any>(key: BindingKey<unknown>, validation?: Validation<I>): ValueFactory {
    const applyValidation = (value?: I) => {
      if (validation) {
        try {
          return this._applyValidation(value, validation);
        } catch (e) {
          throw new Error(`Invalid value for "${key.toString()}": ${e.message}`);
        }
      }
      return value;
    };
    return ({context, options}) => {
      const valueOrPromise = context.getValueOrPromise<I>(key, options);
      return isPromiseLike(valueOrPromise) ? valueOrPromise.then(applyValidation) : applyValidation(valueOrPromise);
    };
  }

  private _applyValidation<I = unknown, O = unknown>(
    value: I | undefined,
    validation: Validation<I, O>,
  ): O | Promise<O> {
    const applyFn = (fn: ValidateFn<I, O>) => {
      const result = fn(value);
      if (isPromiseLike(result)) {
        return result;
      }
      return Promise.resolve(result);
    };

    if ('parse' in validation) {
      return applyFn(validation.parse);
    } else if ('validate' in validation) {
      return applyFn(validation.validate);
    } else if (typeof validation === 'function') {
      return applyFn(validation);
    } else {
      throw new Error(
        'Invalid validation format. Expected a function, or an object with `parse` or `validate` properties.',
      );
    }
  }
}

function isBindingAddress(target: unknown): target is BindingAddress {
  if (!target) {
    return false;
  }
  return typeof target === 'string' || isBindingKey(target);
}

function isBindingKey<T = unknown>(target: unknown): target is BindingKey<T> {
  return (
    typeof target === 'object' &&
    target !== null &&
    typeof (target as BindingKey<T>).key === 'string' &&
    typeof (target as BindingKey<T>).deepProperty === 'function'
  );
}

function isValidation(target: unknown): target is Validation {
  return (
    typeof target === 'function' ||
    (typeof target === 'object' && target !== null && ('parse' in target || 'validate' in target))
  );
}
