import {BindingKey, MetadataAccessor} from '@loopback/core';

import {
  RateLimitAction,
  RateLimitConfig,
  RateLimitMetadata,
  RateLimitMiddlewareConfig,
  RateLimitStoreSource,
} from './types';
import {RateLimitFactoryService} from './services';

export namespace RateLimitSecurityBindings {
  export const ACTION = BindingKey.create<RateLimitAction>('bleco.security.ratelimit.actions');

  export const RATE_LIMIT_FACTORY_SERVICE = BindingKey.create<RateLimitFactoryService>(
    `services.${RateLimitFactoryService.name}`,
  );

  export const METADATA = BindingKey.create<RateLimitMetadata | undefined>(
    'bleco.security.ratelimit.operationMetadata',
  );

  export const CONFIG = BindingKey.create<RateLimitConfig | null>('bleco.security.ratelimit.config');

  export const STORESOURCE = BindingKey.create<RateLimitStoreSource | null>(
    'bleco.security.ratelimit.storesourceProvider',
  );
  export const RATE_LIMIT_CONFIG = BindingKey.create<RateLimitMiddlewareConfig | null>(
    'bleco.security.rateLimitMiddleware.config',
  );
}

export const RATELIMIT_METADATA_ACCESSOR = MetadataAccessor.create<RateLimitMetadata, MethodDecorator>(
  'bleco.security.ratelimit.operationMetadata.accessor',
);
