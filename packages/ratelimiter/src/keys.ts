import {BindingKey, MetadataAccessor} from '@loopback/core';
import {Store} from 'express-rate-limit';
import {RateLimitAction, RateLimitOptions, RateLimitMetadata} from './types';

export namespace RateLimitSecurityBindings {
  export const RATELIMIT_SECURITY_ACTION = BindingKey.create<RateLimitAction>('eco.security.ratelimit.actions');

  export const METADATA = BindingKey.create<RateLimitMetadata | undefined>('eco.security.ratelimit.operationMetadata');

  export const CONFIG = BindingKey.create<RateLimitOptions | null>('eco.security.ratelimit.config');

  export const DATASOURCEPROVIDER = BindingKey.create<Store | null>('eco.security.ratelimit.datasourceProvider');
}

export const RATELIMIT_METADATA_ACCESSOR = MetadataAccessor.create<RateLimitMetadata, MethodDecorator>(
  'eco.security.ratelimit.operationMetadata.accessor',
);
