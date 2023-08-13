import {Binding, Component, inject, ProviderMap, ServiceOrProviderClass} from '@loopback/core';
import {createMiddlewareBinding} from '@loopback/rest';

import {RateLimitSecurityBindings} from './keys';
import {RatelimitMiddlewareProvider} from './middleware';
import {RatelimitActionProvider, RateLimitMetadataProvider, RatelimitStoreSourceProvider} from './providers';
import {RateLimitConfig, RateLimitMiddlewareConfig} from './types';
import {RateLimitFactoryService} from './services';

export class RateLimiterComponent implements Component {
  constructor(
    @inject(RateLimitSecurityBindings.RATE_LIMIT_CONFIG, {optional: true})
    private readonly ratelimitConfig?: RateLimitMiddlewareConfig,
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    private readonly configOptions?: RateLimitConfig,
  ) {
    this.providers = {
      [RateLimitSecurityBindings.ACTION.key]: RatelimitActionProvider,
      [RateLimitSecurityBindings.STORESOURCE.key]: RatelimitStoreSourceProvider,
      [RateLimitSecurityBindings.METADATA.key]: RateLimitMetadataProvider,
    };
    if (!this.configOptions) {
      this.bindings.push(Binding.bind(RateLimitSecurityBindings.CONFIG.key).to(null));
    }
    if (this.ratelimitConfig?.RatelimitActionMiddleware) {
      this.bindings.push(createMiddlewareBinding(RatelimitMiddlewareProvider));
    }
    this.services = [RateLimitFactoryService];
  }

  providers?: ProviderMap;
  bindings: Binding[] = [];
  services: ServiceOrProviderClass[];
}
