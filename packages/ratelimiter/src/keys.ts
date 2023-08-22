import {BindingKey, MetadataAccessor} from '@loopback/core';

import {RateLimitFactoryService} from './services';
import {
  RateLimitAction,
  RateLimitConfig,
  RateLimitMetadata,
  RateLimitMiddlewareConfig,
  RateLimitResults,
  RateLimitStoreSource,
} from './types';

export namespace RateLimitSecurityBindings {
  export const ACTION = BindingKey.create<RateLimitAction>('bleco.security.ratelimit.actions');

  export const METADATA = BindingKey.create<RateLimitMetadata | undefined>(
    'bleco.security.ratelimit.operationMetadata',
  );

  export const CONFIG = BindingKey.create<RateLimitConfig | null>('bleco.security.ratelimit.config');

  export const STORESOURCE = BindingKey.create<RateLimitStoreSource | null>(
    'bleco.security.ratelimit.storesourceProvider',
  );

  export const RATELIMIT_FACTORY_SERVICE = BindingKey.create<RateLimitFactoryService>(
    `services.${RateLimitFactoryService.name}`,
  );

  export const RATELIMIT_CONFIG = BindingKey.create<RateLimitMiddlewareConfig | null>(
    'bleco.security.ratelimit.middleware.config',
  );

  export const RATELIMIT_RESULTS = BindingKey.create<RateLimitResults | undefined>('bleco.security.ratelimit.result');
}

export const RATELIMIT_METADATA_ACCESSOR = MetadataAccessor.create<RateLimitMetadata, MethodDecorator>(
  'bleco.security.ratelimit.operationMetadata.accessor',
);
