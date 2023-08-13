import {BindingScope, injectable, LifeCycleObserver} from '@loopback/core';
import {RateLimiter, RateLimitGroup, RateLimitPossibleStoreOptions, RateLimitStoreClientType} from '../types';
import {
  BurstyRateLimiter,
  IRateLimiterMongoOptions,
  IRateLimiterStoreNoAutoExpiryOptions,
  RateLimiterMemory,
  RateLimiterMongo,
  RateLimiterMySQL,
  RateLimiterPostgres,
  RateLimiterRedis,
  RateLimiterUnion,
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

  get(type: string, options: RateLimitPossibleStoreOptions): RateLimiter {
    debug(`Getting rate limit store with ${type} - ${options}`);
    const key = buildRateLimiterStoreKey(type, options);
    if (!this.stores.has(key)) {
      debug('- Cache miss, creating new store');
      this.stores.set(key, this.createStore(type, options));
    } else {
      debug('- Cache hit, returning existing store');
    }
    return this.stores.get(key)!;
  }

  getGroupLimiter(group: RateLimitGroup | undefined, limiters: RateLimiter[]) {
    if (group === 'union') {
      return new RateLimiterUnion(...limiters);
    } else if (group === 'burst' || group === 'bursty') {
      if (limiters.length !== 2) {
        throw new Error('Bursty rate limiters must have exactly 2 limiters');
      }
      return new BurstyRateLimiter(limiters[0], limiters[1]);
    }
    return limiters[0];
  }

  protected createStore(type: string, opts: RateLimitPossibleStoreOptions): RateLimiter {
    if (type === RateLimitStoreClientType.Memory) {
      return new RateLimiterMemory(opts);
    } else if (type === RateLimitStoreClientType.Redis) {
      return new RateLimiterRedis(opts as IRateLimiterMongoOptions);
    } else if (type === RateLimitStoreClientType.MongoDB) {
      return new RateLimiterMongo(opts as IRateLimiterMongoOptions);
    } else if (type === RateLimitStoreClientType.MySQL) {
      return new RateLimiterMySQL(opts as IRateLimiterStoreNoAutoExpiryOptions);
    } else if (type === RateLimitStoreClientType.Postgres) {
      return new RateLimiterPostgres(opts as IRateLimiterStoreNoAutoExpiryOptions);
    } else {
      throw new Error(`Unsupported store type: ${type}`);
    }
  }
}

function buildRateLimiterStoreKey(
  type: string,
  {points = 0, duration = 0, blockDuration = 0}: RateLimitPossibleStoreOptions,
) {
  return `${type}:${points}:${duration}:${blockDuration}`;
}
