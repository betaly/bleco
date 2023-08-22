import '@bleco/boot';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';

import {RateLimiterComponent} from '../../component';
import {RateLimitSecurityBindings} from '../../keys';
import {TestBindings} from './keys';
import {TestLimiterProvider} from './providers/test-limiter.provider';

export {ApplicationConfig};

export interface TestApplicationConfig extends ApplicationConfig {
  RatelimitActionMiddleware?: boolean;
}

export class TestApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: TestApplicationConfig = {}) {
    super(options);

    this.static('/', path.join(__dirname, '../public'));
    this.bind(RateLimitSecurityBindings.RATELIMIT_CONFIG).to({
      RatelimitActionMiddleware: options.RatelimitActionMiddleware,
    });
    this.component(RateLimiterComponent);

    this.bind(TestBindings.TEST_RATE_LIMITER).toProvider(TestLimiterProvider);

    this.projectRoot = __dirname;
  }
}
