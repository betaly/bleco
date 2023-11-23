/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/context';
import {asGlobalInterceptor} from '@loopback/core';
import {getSanitizationMetadata} from './decorators/sanitize';
import {SanitizationMetadata} from './types';
import {get, set} from './utils';

@injectable(asGlobalInterceptor('sanitization'))
export class SanitizationInterceptor implements Provider<Interceptor> {
  value() {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ): Promise<InvocationResult> {
    const metadata = getSanitizationMetadata(invocationCtx.target, invocationCtx.methodName);

    const result = await next();

    if (metadata) {
      return this.applySanitization(result, metadata);
    }

    return result;
  }

  private applySanitization(data: any, metadata: SanitizationMetadata) {
    const {include, exclude, key} = metadata;
    let result = key ? get(data, key) : data;

    if (Array.isArray(result)) {
      result = result.map(item => this.filterFields(item, include, exclude));
    } else if (typeof result === 'object' && result !== null) {
      result = this.filterFields(result, include, exclude);
    }

    if (key) {
      set(data, key, result);
      return data;
    }

    return result;
  }

  private filterFields(data: any, include?: string[], exclude?: string[]) {
    if (include) {
      data = Object.keys(data)
        .filter(key => include.includes(key))
        .reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {} as any);
    }

    if (exclude) {
      exclude.forEach(field => delete data[field]);
    }

    return data;
  }
}
