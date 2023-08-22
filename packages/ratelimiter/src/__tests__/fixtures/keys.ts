import {BindingKey} from '@loopback/core';

import {RateLimiterOptions} from '../../types';

export namespace TestBindings {
  export const TEST_RATE_LIMITER = BindingKey.create<RateLimiterOptions>('test.rate-limiter');
}
