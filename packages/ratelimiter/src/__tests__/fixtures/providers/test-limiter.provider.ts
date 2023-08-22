import {Provider, inject} from '@loopback/core';
import {RequestContext, RestBindings} from '@loopback/rest';

import {RateLimiterOptions} from '../../../types';

export class TestLimiterProvider implements Provider<RateLimiterOptions> {
  constructor(
    @inject(RestBindings.Http.CONTEXT)
    private readonly ctx: RequestContext,
  ) {}

  value() {
    return {
      points: 5,
      duration: 5,
    };
  }
}
