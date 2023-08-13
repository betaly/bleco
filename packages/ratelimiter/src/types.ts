import {Optional, Request, Response} from '@loopback/rest';
import {
  IRateLimiterMongoOptions,
  IRateLimiterOptions,
  IRateLimiterRedisOptions,
  IRateLimiterStoreOptions,
  RateLimiterAbstract,
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

export interface BaseRateLimitStoreOptions extends Optional<IRateLimiterStoreOptions>, RateLimitOptions {
  ds?: BindingAddress<DataSource> | DataSource | ':memory:';
}

export type RateLimitStoreOptions = BaseRateLimitStoreOptions &
  (IRateLimiterMongoOptions | IRateLimiterRedisOptions | BaseRateLimitStoreOptions);

export type RateLimitConfig = RateLimitStoreOptions & {
  enabledByDefault?: boolean;
};

export interface RateLimitAction {
  (request: Request, response: Response): Promise<void>;
}
/**
 * Rate limit metadata interface for the method decorator
 */
export interface RateLimitMetadata {
  enabled: boolean;
  options?: Partial<RateLimitOptions>;
}

export interface RateLimitStoreSource extends Pick<RateLimitStoreOptions, 'storeClient'> {
  type: RateLimitStoreClientType;
  storeClient: unknown;
}

export type Writable<T> = {-readonly [P in keyof T]: T[P]};
export interface RateLimitMiddlewareConfig {
  RatelimitActionMiddleware?: boolean;
}
