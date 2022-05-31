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
  static create(from: BindingKey<object>, metadata: AliasMetadata): Aliaser;
  static create(metadata: AliasMetadata): Aliaser;
  static create(fromOrMetadata: BindingKey<object> | AliasMetadata, metadata?: AliasMetadata): Aliaser {
    if (isBindingKey(fromOrMetadata)) {
      assert(metadata, '`metadata` is required');
      return new Aliaser(fromOrMetadata, metadata);
    } else {
      return new Aliaser(CoreBindings.APPLICATION_CONFIG, fromOrMetadata);
    }
  }

  private constructor(public readonly from: BindingKey<object>, public readonly metadata: AliasMetadata) {}

  alias(context: Context, options?: AliasOptions) {
    this.doAlias(context, '', this.metadata, options ?? {});
  }

  protected doAlias(context: Context, prop: string, target: BindingAddress | AliasMetadata, options: AliasOptions) {
    if (isBindingAddress(target)) {
      if (options?.override || !context.isBound(target)) {
        context.bind(target).toAlias(this.from.deepProperty(prop));
      }
    } else if (isPlainObject(target)) {
      each((value, key) => {
        this.doAlias(context, (prop ? prop + '.' : '') + key, value, options);
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
