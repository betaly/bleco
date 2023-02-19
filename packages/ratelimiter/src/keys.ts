import {BindingKey, MetadataAccessor} from '@loopback/core';
import {Store} from 'express-rate-limit';
import {RateLimitAction, RateLimitMetadata, RateLimitOptions} from './types';

export namespace RateLimitSecurityBindings {
  export const RATELIMIT_SECURITY_ACTION = BindingKey.create<RateLimitAction>('bleco.security.ratelimit.actions');

  export const METADATA = BindingKey.create<RateLimitMetadata | undefined>(
    'bleco.security.ratelimit.operationMetadata',
  );

  export const CONFIG = BindingKey.create<RateLimitOptions | null>('bleco.security.ratelimit.config');

  export const DATASOURCEPROVIDER = BindingKey.create<Store | null>('bleco.security.ratelimit.datasourceProvider');
}

export const RATELIMIT_METADATA_ACCESSOR = MetadataAccessor.create<RateLimitMetadata, MethodDecorator>(
  'bleco.security.ratelimit.operationMetadata.accessor',
);
