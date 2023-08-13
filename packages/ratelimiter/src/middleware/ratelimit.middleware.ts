// @SONAR_STOP@
import {inject, injectable, Next, Provider} from '@loopback/core';
import {asMiddleware, Middleware, MiddlewareContext, Request, Response, RestMiddlewareGroups} from '@loopback/rest';

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
      await this.action(ctx.request, ctx.response);
      return next();
    };
  }

  async action(request: Request, response: Response): Promise<void> {
    return this.rateLimitAction(request, response);
  }
}
