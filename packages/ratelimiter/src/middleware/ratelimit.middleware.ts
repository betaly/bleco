import {Next, Provider, inject, injectable} from '@loopback/core';
import {Middleware, MiddlewareContext, RequestContext, RestMiddlewareGroups, asMiddleware} from '@loopback/rest';

import {RateLimitSecurityBindings} from '../keys';
import {RateLimitAction} from '../types';
import {RatelimitActionMiddlewareGroup} from './middleware.enum';

@injectable(
  asMiddleware({
    group: RatelimitActionMiddlewareGroup.RATELIMIT,
    upstreamGroups: RestMiddlewareGroups.PARSE_PARAMS,
    downstreamGroups: [RestMiddlewareGroups.INVOKE_METHOD],
  }),
)
export class RatelimitMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RateLimitSecurityBindings.ACTION)
    private readonly rateLimitAction: RateLimitAction,
  ) {}

  value() {
    return async (ctx: MiddlewareContext, next: Next) => {
      await this.rateLimitAction(ctx as RequestContext);
      return next();
    };
  }
}
