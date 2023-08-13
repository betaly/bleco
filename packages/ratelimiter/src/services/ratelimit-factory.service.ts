import {BindingScope, injectable, LifeCycleObserver} from '@loopback/core';
import {RateLimiter, RateLimitStoreClientType, RateLimitStoreOptions, RateLimitStoreSource} from '../types';
import {
  RateLimiterMemory,
  RateLimiterMongo,
  RateLimiterMySQL,
  RateLimiterPostgres,
  RateLimiterRedis,
} from 'rate-limiter-flexible';
import debugFactory from 'debug';

const debug = debugFactory('bleco:ratelimiter:factory');

@injectable({scope: BindingScope.SINGLETON})
export class RateLimitFactoryService implements LifeCycleObserver {
  protected readonly stores: Map<string, RateLimiter> = new Map();

  start() {
    debug('Starting rate limit factory service');
  }

  stop() {
    debug('Stopping rate limit factory service');
    this.clear();
  }

  clear() {
    debug('Clearing all rate limit stores');
    this.stores.clear();
  }

  get(options: RateLimitStoreSource & RateLimitStoreOptions): RateLimiter {
    debug('Getting rate limit store with options: %o', options);
    const {type, ...opts} = options;
    const key = buildRateLimiterStoreKey(options);
    if (!this.stores.has(key)) {
      debug('- Cache miss, creating new store');
      this.stores.set(key, this.createStore(options));
    } else {
      debug('- Cache hit, returning existing store');
    }
    return this.stores.get(key)!;
  }

  protected createStore(options: RateLimitStoreSource & RateLimitStoreOptions): RateLimiter {
    const {type, ...opts} = options;
    if (type === RateLimitStoreClientType.Memory) {
      return new RateLimiterMemory(opts);
    } else if (type === RateLimitStoreClientType.Redis) {
      return new RateLimiterRedis(opts);
    } else if (type === RateLimitStoreClientType.MongoDB) {
      return new RateLimiterMongo(opts);
    } else if (type === RateLimitStoreClientType.MySQL) {
      return new RateLimiterMySQL(opts);
    } else if (type === RateLimitStoreClientType.Postgres) {
      return new RateLimiterPostgres(opts);
    } else {
      throw new Error(`Unsupported store type: ${RateLimitStoreClientType[type]}`);
    }
  }
}

function buildRateLimiterStoreKey({
  type,
  points = 0,
  duration = 0,
  blockDuration = 0,
}: RateLimitStoreSource & RateLimitStoreOptions) {
  return `${type}:${points}:${duration}:${blockDuration}`;
}
