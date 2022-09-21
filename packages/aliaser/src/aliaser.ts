import {BindingAddress, BindingKey, Context} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {assert} from 'tily/assert';
import isPlainObject from 'tily/is/plainObject';
import each from 'tily/object/each';

export interface AliasMetadata {
  [prop: string]: BindingAddress | AliasMetadata;
}

export interface AliasOptions {
  override?: boolean;
}

export class Aliaser {
  /**
   * Create a new aliaser with the given aliasing metadata.
   * @param from
   * @param metadata
   */
  static alias(from: BindingKey<object>, metadata: AliasMetadata): Aliaser;
  static alias(metadata: AliasMetadata): Aliaser;
  static alias(fromOrMetadata: BindingKey<object> | AliasMetadata, metadata?: AliasMetadata): Aliaser {
    return new Aliaser().alias(fromOrMetadata as BindingKey<object>, metadata!);
  }

  /**
   * Create a new aliaser with the given aliasing metadata.
   *
   * @deprecated Use `alias` instead.
   * @param from
   * @param metadata
   */
  static create(from: BindingKey<object>, metadata: AliasMetadata): Aliaser;
  static create(metadata: AliasMetadata): Aliaser;
  static create(fromOrMetadata: BindingKey<object> | AliasMetadata, metadata?: AliasMetadata): Aliaser {
    return new Aliaser().alias(fromOrMetadata as BindingKey<object>, metadata!);
  }

  private items: [BindingKey<object>, AliasMetadata][] = [];

  private constructor() {}

  alias(from: BindingKey<object>, metadata: AliasMetadata): Aliaser;
  alias(metadata: AliasMetadata): Aliaser;
  alias(fromOrMetadata: BindingKey<object> | AliasMetadata, metadata?: AliasMetadata): Aliaser {
    if (isBindingKey(fromOrMetadata)) {
      assert(metadata, '`metadata` is required');
      this.items.push([fromOrMetadata, metadata]);
    } else {
      this.items.push([CoreBindings.APPLICATION_CONFIG, fromOrMetadata]);
    }
    return this;
  }

  /**
   * Apply to the given context with the given metadata.
   * @param context
   * @param options
   */
  apply(context: Context, options?: AliasOptions) {
    this.items.forEach(([from, metadata]) => {
      this._apply(context, from ?? CoreBindings.APPLICATION_CONFIG, '', metadata, options ?? {});
    });
    return this;
  }

  protected _apply(
    context: Context,
    from: BindingKey<object>,
    prop: string,
    target: BindingAddress | AliasMetadata,
    options: AliasOptions,
  ) {
    if (isBindingAddress(target)) {
      if (options?.override || !context.isBound(target)) {
        context.bind(target).toAlias(from.deepProperty(prop));
      }
    } else if (isPlainObject(target)) {
      each((value, key) => {
        this._apply(context, from, (prop ? prop + '.' : '') + key, value, options);
      }, target);
    } else {
      throw new Error('Invalid alias metadata: ' + prop);
    }
  }
}

export function isBindingAddress(target: unknown): target is BindingAddress {
  if (!target) {
    return false;
  }
  return typeof target === 'string' || isBindingKey(target);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isBindingKey<T = any>(target: any): target is BindingKey<T> {
  return (
    target && typeof target === 'object' && typeof target.key === 'string' && typeof target.deepProperty === 'function'
  );
}
