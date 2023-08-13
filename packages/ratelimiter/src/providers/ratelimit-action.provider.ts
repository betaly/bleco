import {inject, Provider, service} from '@loopback/core';
import {Getter} from '@loopback/repository';
import {Request, Response} from '@loopback/rest';

import {RateLimitSecurityBindings} from '../keys';
import {RateLimitAction, RateLimitConfig, RateLimitMetadata, RateLimitStoreSource} from '../types';
import {defaultKey} from '../stores';
import {BErrors} from 'berrors';
import {RateLimitFactoryService} from '../services';

export class RatelimitActionProvider implements Provider<RateLimitAction> {
  constructor(
    @inject.getter(RateLimitSecurityBindings.STORESOURCE)
    private readonly getStoreSource: Getter<RateLimitStoreSource>,
    @inject.getter(RateLimitSecurityBindings.METADATA)
    private readonly getMetadata: Getter<RateLimitMetadata>,
    @service(RateLimitFactoryService)
    private readonly rateLimiterFactory: RateLimitFactoryService,
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
    const storeSource = await this.getStoreSource();
    // Perform rate limiting now
    // First check if rate limit options available at method level
    const operationMetadata = metadata ? metadata.options : {};

    // Create options based on global config and method level config
    const opts = Object.assign({}, this.config, operationMetadata);

    const key = opts.key ?? defaultKey;
    const message = opts.message;

    const k = metadata ?? this.config;

    const limiter = this.rateLimiterFactory.get({...storeSource, ...opts});
    try {
      await limiter.consume(await key(request, response));
    } catch (err) {
      throw new BErrors.TooManyRequests(message ?? 'Too many requests, please try again later.');
    }
  }
}
