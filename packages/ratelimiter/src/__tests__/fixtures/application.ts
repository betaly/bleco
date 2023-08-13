import '@bleco/boot';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';

import {RateLimitSecurityBindings} from '../../keys';
import {RateLimiterComponent} from '../../component';

export {ApplicationConfig};

export interface TestApplicationConfig extends ApplicationConfig {
  RatelimitActionMiddleware?: boolean;
}

export class TestApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: TestApplicationConfig = {}) {
    super(options);

    this.static('/', path.join(__dirname, '../public'));
    this.bind(RateLimitSecurityBindings.RATE_LIMIT_CONFIG).to({
      RatelimitActionMiddleware: options.RatelimitActionMiddleware,
    });
    this.component(RateLimiterComponent);

    this.projectRoot = __dirname;
  }
}
