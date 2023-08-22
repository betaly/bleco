import {BindingAddress} from '@loopback/context';
import {BindingKey} from '@loopback/core';
import {Class, DataSource, juggler} from '@loopback/repository';
import {Optional, RequestContext} from '@loopback/rest';
import {
  BurstyRateLimiter,
  IRateLimiterMongoOptions,
  IRateLimiterOptions,
  IRateLimiterRedisOptions,
  IRateLimiterStoreNoAutoExpiryOptions,
  IRateLimiterStoreOptions,
  RateLimiterAbstract,
  RateLimiterRes,
  RateLimiterUnion,
} from 'rate-limiter-flexible';
import {OmitProperties} from 'ts-essentials';

export type ValueFromMiddleware<T> = (context: RequestContext) => T | Promise<T>;
/**
 * Method (in the form of middleware) to generate/retrieve a value based on the
 * incoming request.
 *
 */
export type ValueOrFromMiddleware<T> = ValueFromMiddleware<T> | BindingKey<T> | T;

export type BaseRateLimiter = RateLimiterAbstract;
export type GroupedRateLimiter = BurstyRateLimiter | RateLimiterUnion;
export type PossibleRateLimiter = BaseRateLimiter | GroupedRateLimiter;

export type RateLimiterOptions = IRateLimiterOptions;
export type RateLimiterStoreOptions = IRateLimiterStoreOptions;

export type RateLimitResult = RateLimiterRes;
export type RateLimitResults = Record<string, RateLimitResult> | RateLimitResult;
export type RateLimitResultWithPoints = OmitProperties<RateLimitResult, Function> & {points?: number};

export enum RateLimitStoreClientType {
  Memory = 'memory',
  Redis = 'redis',
  MongoDB = 'mongo',
  Postgres = 'postgres',
  MySQL = 'mysql',
}

interface WithProvider {
  provider?: ValueFromMiddleware<RateLimiterOptions> | BindingAddress<RateLimiterOptions>;
}

export type RateLimiterOptionsWithProvider = RateLimiterOptions & WithProvider;
export type RateLimiterStoreOptionsWithProvider = RateLimiterStoreOptions & WithProvider;

export interface RateLimitOptionsWithKey extends RateLimiterOptionsWithProvider {
  message?: string;
  key?: ValueOrFromMiddleware<string>;
}

export interface RateLimitStoreOptions extends Optional<RateLimiterStoreOptionsWithProvider>, RateLimitOptionsWithKey {
  ds?: BindingAddress<DataSource> | Class<juggler.DataSource> | juggler.DataSource | ':memory:';
}

export type RateLimitPossibleStoreOptions =
  | RateLimitStoreOptions
  | (RateLimitStoreOptions &
      (IRateLimiterMongoOptions | IRateLimiterRedisOptions | IRateLimiterStoreNoAutoExpiryOptions));

export type RateLimitConfig = RateLimitPossibleStoreOptions & {
  enabledByDefault?: boolean;
  headers?: boolean | 'legacy';
};

export interface RateLimitAction {
  (context: RequestContext): Promise<void>;
}

export type RateLimitGroup = 'none' | 'union' | 'burst' | 'bursty';

export interface RateLimitMetadataOptions {
  group?: RateLimitGroup;
  key?: ValueOrFromMiddleware<string>;
  message?: string;
  limiters: RateLimiterOptionsWithProvider[];
}
/**
 * Rate limit metadata interface for the method decorator
 */
export interface RateLimitMetadata {
  enabled: boolean;
  options?: RateLimitMetadataOptions;
}

export interface RateLimitStoreSource {
  type: RateLimitStoreClientType;
  storeClient: unknown;
}

export type Writable<T> = {-readonly [P in keyof T]: T[P]};
export interface RateLimitMiddlewareConfig {
  RatelimitActionMiddleware?: boolean;
}
