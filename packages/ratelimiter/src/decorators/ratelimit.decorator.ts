import {MethodDecoratorFactory} from '@loopback/core';
import {Options} from 'express-rate-limit';

import {RATELIMIT_METADATA_ACCESSOR} from '../keys';
import {RateLimitMetadata} from '../types';

export function ratelimit(enabled: boolean, options?: Options) {
  return MethodDecoratorFactory.createDecorator<RateLimitMetadata>(RATELIMIT_METADATA_ACCESSOR, {
    enabled: enabled,
    options,
  });
}
