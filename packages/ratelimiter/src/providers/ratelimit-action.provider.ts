import {inject, Provider, service} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {Request, Response} from '@loopback/rest';

import {RateLimitSecurityBindings} from '../keys';
import {
  RateLimitAction,
  RateLimitConfig,
  RateLimitMetadata,
  RateLimitMetadataOptions,
  RateLimitResults,
  RateLimitStoreSource,
} from '../types';
import {defaultKey} from '../stores';
import {BErrors} from 'berrors';
import {RateLimitFactoryService} from '../services';
import {isEmpty, isRateLimitResult, setLimitHeaders} from '../utils';

const DEFAULT_TOO_MANY_REQUEST_MESSAGE = 'Too many requests, please try again later.';

export class RatelimitActionProvider implements Provider<RateLimitAction> {
  constructor(
    @inject.getter(RateLimitSecurityBindings.STORESOURCE)
    private readonly getStoreSource: Getter<RateLimitStoreSource>,
    @inject.getter(RateLimitSecurityBindings.METADATA)
    private readonly getMetadata: Getter<RateLimitMetadata>,
    @service(RateLimitFactoryService)
    private readonly rateLimiterFactory: RateLimitFactoryService,
    @inject.setter(RateLimitSecurityBindings.RATE_LIMIT_RESULTS)
    private readonly setRateLimitResults: (res: RateLimitResults) => void,
    @inject(RateLimitSecurityBindings.CONFIG, {
      optional: true,
    })
    private readonly config?: RateLimitConfig,
  ) {}

  value(): RateLimitAction {
    return (req, resp) => this.action(req, resp);
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
    const {type, storeClient} = await this.getStoreSource();
    // Perform rate limiting now
    // First check if rate limit options available at method level
    const operationOperations: RateLimitMetadataOptions = metadata?.options ?? {limiters: []};
    const group = operationOperations.group;

    const key = operationOperations.key ?? this.config?.key ?? defaultKey;
    const message = operationOperations.message ?? this.config?.message ?? DEFAULT_TOO_MANY_REQUEST_MESSAGE;

    const items = operationOperations.limiters ?? [];

    const limiter = isEmpty(items)
      ? this.rateLimiterFactory.get(type, {storeClient, ...this.config})
      : this.rateLimiterFactory.getGroupLimiter(
          group,
          items.map(item => {
            return this.rateLimiterFactory.get(type, {storeClient, ...this.config, ...item});
          }),
        );

    let results: RateLimitResults | undefined;

    try {
      results = (await limiter.consume(await key(request, response))) as RateLimitResults;
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
