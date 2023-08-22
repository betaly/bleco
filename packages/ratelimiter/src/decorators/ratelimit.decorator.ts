import {MethodDecoratorFactory} from '@loopback/core';

import {RATELIMIT_METADATA_ACCESSOR} from '../keys';
import {RateLimitMetadata, RateLimitMetadataOptions, RateLimitOptionsWithKey} from '../types';
import {isRateLimitMetadataOptions, toArray} from '../utils';

export function ratelimit(
  enabled: boolean,
  options?: RateLimitMetadataOptions | RateLimitOptionsWithKey,
): MethodDecorator;
export function ratelimit(options: RateLimitMetadataOptions | RateLimitOptionsWithKey): MethodDecorator;
export function ratelimit(
  enabledOrOptions: boolean | RateLimitMetadataOptions | RateLimitOptionsWithKey,
  opts?: RateLimitMetadataOptions | RateLimitOptionsWithKey,
): MethodDecorator {
  let enabled: boolean;

  if (typeof enabledOrOptions === 'boolean') {
    enabled = enabledOrOptions;
  } else {
    enabled = true;
    opts = enabledOrOptions ?? {};
  }

  const options: RateLimitMetadataOptions = isRateLimitMetadataOptions(opts)
    ? opts
    : {key: opts?.key, message: opts?.message, limiters: toArray(opts)};

  return MethodDecoratorFactory.createDecorator<RateLimitMetadata>(RATELIMIT_METADATA_ACCESSOR, {
    enabled: enabled,
    options,
  });
}

export namespace ratelimit {
  export function union(enabled: boolean, options: RateLimitMetadataOptions): MethodDecorator;
  export function union(options: RateLimitMetadataOptions): MethodDecorator;
  export function union(
    enabledOrOptions: boolean | RateLimitMetadataOptions,
    options?: RateLimitMetadataOptions,
  ): MethodDecorator {
    let enabled: boolean;

    if (typeof enabledOrOptions === 'boolean') {
      enabled = enabledOrOptions;
    } else {
      enabled = true;
      options = enabledOrOptions ?? {};
    }

    return ratelimit(enabled, {
      ...options,
      group: 'union',
    });
  }

  export function burst(enabled: boolean, options: RateLimitMetadataOptions): MethodDecorator;
  export function burst(options: RateLimitMetadataOptions): MethodDecorator;
  export function burst(
    enabledOrOptions: boolean | RateLimitMetadataOptions,
    options?: RateLimitMetadataOptions,
  ): MethodDecorator {
    let enabled: boolean;

    if (typeof enabledOrOptions === 'boolean') {
      enabled = enabledOrOptions;
    } else {
      enabled = true;
      options = enabledOrOptions ?? {};
    }

    return ratelimit(enabled, {
      ...options,
      group: 'bursty',
    });
  }
}
