import {DataSource} from '@loopback/repository';
import {RateLimitMetadataOptions, RateLimitResult} from './types';
import {RateLimiterRes} from 'rate-limiter-flexible';
import {Response} from '@loopback/rest';

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

export function isRateLimitMetadataOptions(val: unknown): val is RateLimitMetadataOptions {
  return !!val && typeof val === 'object' && (val as RateLimitMetadataOptions).limiters != null;
}

export function isRateLimitResult(val: unknown): val is RateLimitResult {
  return !!val && typeof val === 'object' && (val as RateLimitResult).remainingPoints != null;
}

export function setLimitHeaders(response: Response, result: RateLimiterRes, legacy?: boolean) {
  const prefix = legacy ? 'X-RateLimit' : 'RateLimit';
  response.setHeader(`Retry-After`, Math.ceil(result.msBeforeNext / 1000));
  response.setHeader(`${prefix}-Limit`, result.remainingPoints + result.consumedPoints);
  response.setHeader(`${prefix}-Remaining`, result.remainingPoints);
  response.setHeader(`${prefix}-Reset`, Math.ceil(result.msBeforeNext / 1000));
}
