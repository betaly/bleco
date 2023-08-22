import {Provider, inject, service} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {RequestContext, Response} from '@loopback/rest';
import {BErrors} from 'berrors';

import {RateLimitSecurityBindings} from '../keys';
import {RateLimitFactoryService} from '../services';
import {defaultKey} from '../stores';
import {
  RateLimitAction,
  RateLimitConfig,
  RateLimitMetadata,
  RateLimitMetadataOptions,
  RateLimitResults,
  RateLimitStoreSource,
  RateLimiterOptions,
  RateLimiterOptionsWithProvider,
  ValueFromMiddleware,
  ValueOrFromMiddleware,
} from '../types';
import {isBindingKey, isEmpty, isRateLimitResult, setLimitHeaders} from '../utils';

const DEFAULT_TOO_MANY_REQUEST_MESSAGE = 'Too many requests, please try again later.';

export class RatelimitActionProvider implements Provider<RateLimitAction> {
  constructor(
    @inject.getter(RateLimitSecurityBindings.STORESOURCE)
    private readonly getStoreSource: Getter<RateLimitStoreSource>,
    @inject.getter(RateLimitSecurityBindings.METADATA)
    private readonly getMetadata: Getter<RateLimitMetadata>,
    @service(RateLimitFactoryService)
    private readonly rateLimiterFactory: RateLimitFactoryService,
    @inject.setter(RateLimitSecurityBindings.RATELIMIT_RESULTS)
    private readonly setRateLimitResults: (res: RateLimitResults) => void,
    @inject(RateLimitSecurityBindings.CONFIG, {
      optional: true,
    })
    private readonly config?: RateLimitConfig,
  ) {}

  value(): RateLimitAction {
    return context => this.action(context);
  }

  async action(context: RequestContext): Promise<void> {
    const enabledByDefault = this.config?.enabledByDefault ?? true;
    const metadata: RateLimitMetadata = await this.getMetadata();

    if (enabledByDefault || metadata?.enabled) {
      await this.doRateLimit(context);
    }
  }

  async doRateLimit(context: RequestContext) {
    const {response} = context;
    const metadata: RateLimitMetadata = await this.getMetadata();
    const {type, storeClient} = await this.getStoreSource();
    // Perform rate limiting now
    // First check if rate limit options available at method level
    const operationOperations: RateLimitMetadataOptions = metadata?.options ?? {limiters: []};
    const group = operationOperations.group;

    const key = operationOperations.key ?? this.config?.key ?? defaultKey;
    const message = operationOperations.message ?? this.config?.message ?? DEFAULT_TOO_MANY_REQUEST_MESSAGE;

    const resolvedConfig = await resolveRateLimitOptions(context, this.config ?? {});

    const items = operationOperations.limiters ?? [];

    const limiter = isEmpty(items)
      ? this.rateLimiterFactory.get(type, {storeClient, ...this.config, ...resolvedConfig})
      : this.rateLimiterFactory.getGroupLimiter(
          group,
          await Promise.all(
            items.map(async item => {
              const opts = {storeClient, ...this.config, ...item};
              const resolvedOpts = await resolveRateLimitOptions(context, opts);
              return this.rateLimiterFactory.get(type, {
                ...opts,
                ...resolvedOpts,
              });
            }),
          ),
        );

    let results: RateLimitResults | undefined;

    try {
      results = (await limiter.consume(await resolveValue(context, key))) as RateLimitResults;
    } catch (err) {
      if (isRateLimitResult(err) || isRateLimitResult(Object.values(err)[0])) {
        results = err;
        throw new BErrors.TooManyRequests(message);
      }
      throw err;
    } finally {
      if (results) {
        this.setRateLimitResults(results);
        if (this.config?.headers) {
          await this.sendHeaders(response, results, this.config?.headers === 'legacy');
        }
      }
    }
  }

  async sendHeaders(response: Response, results: RateLimitResults, legacy: boolean) {
    const result = isRateLimitResult(results)
      ? results
      : (items => items.find(item => item.remainingPoints > 0) ?? items[0])(Object.values(results));

    if (result) {
      setLimitHeaders(response, result, legacy);
    }
  }
}

async function resolveValue<T>(ctx: RequestContext, val: ValueOrFromMiddleware<T>): Promise<T> {
  if (isBindingKey(val)) {
    return (await ctx.get(val)) as T;
  } else if (typeof val === 'function') {
    return (val as ValueFromMiddleware<T>)(ctx);
  }
  return val;
}

async function resolveRateLimitOptions(
  ctx: RequestContext,
  opts: RateLimiterOptionsWithProvider,
): Promise<RateLimiterOptions> {
  const {provider, ...rest} = opts;
  if (typeof provider === 'function') {
    return {...rest, ...((await provider(ctx)) ?? {})};
  } else if (isBindingKey(provider)) {
    return {...rest, ...((await ctx.get(provider)) ?? {})};
  }
  return rest;
}
