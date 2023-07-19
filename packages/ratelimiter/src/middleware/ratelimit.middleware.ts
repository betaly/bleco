// @SONAR_STOP@
import {CoreBindings, inject, injectable, Next, Provider} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {
  asMiddleware,
  HttpErrors,
  Middleware,
  MiddlewareContext,
  Request,
  Response,
  RestApplication,
  RestMiddlewareGroups,
} from '@loopback/rest';
import rateLimit, {Store} from 'express-rate-limit';

import {RateLimitSecurityBindings} from '../keys';
import {RateLimitMetadata, RateLimitOptions} from '../types';
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
    @inject.getter(RateLimitSecurityBindings.DATASOURCEPROVIDER)
    private readonly getDatastore: Getter<Store>,
    @inject.getter(RateLimitSecurityBindings.METADATA)
    private readonly getMetadata: Getter<RateLimitMetadata>,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly application: RestApplication,
    @inject(RateLimitSecurityBindings.CONFIG, {
      optional: true,
    })
    private readonly config?: RateLimitOptions,
  ) {}

  value() {
    const middleware = async (ctx: MiddlewareContext, next: Next) => {
      await this.action(ctx.request, ctx.response);
      return next();
    };
    return middleware;
  }

  async action(request: Request, response: Response): Promise<void> {
    const enabledByDefault = this.config?.enabledByDefault ?? true;
    const metadata: RateLimitMetadata = await this.getMetadata();

    if (enabledByDefault || metadata?.enabled) {
      await this.doRateLimit(request, response);
    }
  }

  async doRateLimit(request: Request, response: Response) {
    const metadata: RateLimitMetadata = await this.getMetadata();
    const dataStore = await this.getDatastore();
    // Perform rate limiting now
    return new Promise<void>((resolve, reject) => {
      // First check if rate limit options available at method level
      const operationMetadata = metadata ? metadata.options : {};

      // Create options based on global config and method level config
      const opts = Object.assign({}, this.config, operationMetadata);

      if (dataStore) {
        opts.store = dataStore;
      }

      if (!opts.handler) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        opts.handler = async (req: Request, res: Response, next: Function) => {
          const message = typeof opts.message === 'function' ? await opts.message(req, res) : opts.message;
          next(new HttpErrors.TooManyRequests(message ?? 'Too many requests, please try again later.'));
        };
      }

      const limiter = rateLimit(opts);
      limiter(request, response, (err: unknown) => (err ? reject(err) : resolve()));
    });
  }
}
// @SONAR_START@
