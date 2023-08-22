import {Binding, Component, ProviderMap, ServiceOrProviderClass, inject} from '@loopback/core';
import {createMiddlewareBinding} from '@loopback/rest';

import {RateLimitSecurityBindings} from './keys';
import {RatelimitMiddlewareProvider} from './middleware';
import {RateLimitMetadataProvider, RatelimitActionProvider, RatelimitStoreSourceProvider} from './providers';
import {RateLimitFactoryService} from './services';
import {RateLimitConfig, RateLimitMiddlewareConfig} from './types';

export class RateLimiterComponent implements Component {
  constructor(
    @inject(RateLimitSecurityBindings.RATELIMIT_CONFIG, {optional: true})
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
