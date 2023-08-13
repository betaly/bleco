import {Optional, Request, Response} from '@loopback/rest';
import {
  IRateLimiterMongoOptions,
  IRateLimiterOptions,
  IRateLimiterRedisOptions,
  IRateLimiterStoreNoAutoExpiryOptions,
  IRateLimiterStoreOptions,
  RateLimiterAbstract,
  RateLimiterRes,
} from 'rate-limiter-flexible';
import {BindingAddress} from '@loopback/context';
import {DataSource} from '@loopback/repository';

/**
 * Method (in the form of middleware) to generate/retrieve a value based on the
 * incoming request.
 *
 */
export type ValueDeterminingMiddleware<T> = (request: Request, response: Response) => T | Promise<T>;

export type RateLimiter = RateLimiterAbstract;

export type RateLimitResult = RateLimiterRes;
export type RateLimitResults = Record<string, RateLimiterRes> | RateLimitResult;

export enum RateLimitStoreClientType {
  Memory = 'memory',
  Redis = 'redis',
  MongoDB = 'mongo',
  Postgres = 'postgres',
  MySQL = 'mysql',
}

export interface RateLimitOptions extends IRateLimiterOptions {
  message?: string;
  key?: ValueDeterminingMiddleware<string>;
}

export interface RateLimitStoreOptions extends Optional<IRateLimiterStoreOptions>, RateLimitOptions {
  ds?: BindingAddress<DataSource> | DataSource | ':memory:';
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
  (request: Request, response: Response): Promise<void>;
}

export type RateLimitGroup = 'none' | 'union' | 'burst' | 'bursty';

export interface RateLimitMetadataOptions {
  group?: RateLimitGroup;
  key?: ValueDeterminingMiddleware<string>;
  message?: string;
  limiters: IRateLimiterOptions[];
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
