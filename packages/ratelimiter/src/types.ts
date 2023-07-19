import {Request, Response} from '@loopback/rest';
import {IncrementCallback, Options, Store as RateLimitStore} from 'express-rate-limit';
import {RedisClient} from 'redis';

import IORedis = require('ioredis');

export type RedisClientType = IORedis.Redis | RedisClient;

export interface DataSourceConfig {
  name: string;
  client?: string | RedisClientType;
  type?: string;
  uri?: string;
  collectionName?: string;
}
export interface RateLimitConfig {
  enabledByDefault?: boolean;
}
export interface RateLimitAction {
  (request: Request, response: Response): Promise<void>;
}

export type RateLimitOptions = Writable<Partial<Options>> & DataSourceConfig & RateLimitConfig;

/**
 * Rate limit metadata interface for the method decorator
 */
export interface RateLimitMetadata {
  enabled: boolean;
  options?: Partial<Options>;
}

export interface LegacyStore extends Omit<RateLimitStore, 'increment'> {
  /**
   * @deprecated use increment
   */
  incr(key: string, cb: IncrementCallback): void;
}

export type Store = RateLimitStore | LegacyStore;

export type Writable<T> = {-readonly [P in keyof T]: T[P]};
export interface RateLimitMiddlewareConfig {
  RatelimitActionMiddleware?: boolean;
}
