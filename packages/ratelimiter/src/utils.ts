import {isBindingAddress as _isBindingAddress} from '@loopback/context';
import {BindingKey} from '@loopback/core';
import {DataSource} from '@loopback/repository';
import {Response} from '@loopback/rest';

import {
  BaseRateLimiter,
  PossibleRateLimiter,
  RateLimitMetadataOptions,
  RateLimitResult,
  RateLimitResultWithPoints,
} from './types';

export const noop = () => {};

export function toArray<T>(val?: T | T[] | undefined | null): T[] {
  return val == null ? [] : Array.isArray(val) ? val : [val];
}

export function isEmpty(val: unknown): boolean {
  if (val == null) return true;
  if (typeof val === 'string') return val.trim().length === 0;
  if (Array.isArray(val)) return val.length === 0;
  if (typeof val === 'object') return Object.keys(val).length === 0;
  return false;
}

export function isDataSource(ds: unknown): ds is DataSource {
  return !!ds && typeof ds === 'object' && typeof (ds as DataSource).connect === 'function';
}

export function isBindingKey<T>(selector: unknown): selector is BindingKey<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof selector !== 'string' && _isBindingAddress(selector as any);
}

export function isRateLimitMetadataOptions(val: unknown): val is RateLimitMetadataOptions {
  return !!val && typeof val === 'object' && (val as RateLimitMetadataOptions).limiters != null;
}

export function isRateLimitResult(val: unknown): val is RateLimitResult {
  return !!val && typeof val === 'object' && (val as RateLimitResult).remainingPoints != null;
}

export function setRateLimitHeaders(response: Response, result: RateLimitResultWithPoints, legacy?: boolean) {
  const prefix = legacy ? 'X-RateLimit' : 'RateLimit';
  response.setHeader(`Retry-After`, Math.ceil(result.msBeforeNext / 1000));
  if (result.points != null) {
    response.setHeader(`${prefix}-Limit`, result.points);
  }
  response.setHeader(`${prefix}-Remaining`, result.remainingPoints);
  response.setHeader(`${prefix}-Reset`, Math.ceil(result.msBeforeNext / 1000));
}

export function getPoints(limiter: PossibleRateLimiter, keyPrefix?: string) {
  if ('points' in limiter) {
    // BaseRateLimiter
    return limiter.points;
  } else if ('_limiters' in limiter) {
    // RateLimiterUnion
    if (keyPrefix) {
      return (limiter._limiters as BaseRateLimiter[]).find(l => l.keyPrefix === keyPrefix)?.points;
    }
  } else if ('_rateLimiter' in limiter) {
    // BurstyRateLimiter
    return (limiter._rateLimiter as BaseRateLimiter).points;
  }
}
