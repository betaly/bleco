import {MethodDecoratorFactory} from '@loopback/core';

import {RATELIMIT_METADATA_ACCESSOR} from '../keys';
import {RateLimitMetadata, RateLimitOptions} from '../types';

export function ratelimit(enabled: boolean, options?: Partial<RateLimitOptions>) {
  return MethodDecoratorFactory.createDecorator<RateLimitMetadata>(RATELIMIT_METADATA_ACCESSOR, {
    enabled,
    options,
  });
}
