import {RequestContext} from '@loopback/rest';

import {RateLimitStoreClientType} from './types';

export const SupportedStoreClientRegexps = [
  [/^kv-memory$/i, RateLimitStoreClientType.Memory],
  [/^kv-redis$/i, RateLimitStoreClientType.Redis],
  [/^memory$/i, RateLimitStoreClientType.Memory],
  [/^redis$/i, RateLimitStoreClientType.Redis],
  [/^mongo|mongodb$/i, RateLimitStoreClientType.MongoDB],
  [/^mysql|maria|mariadb$/i, RateLimitStoreClientType.MySQL],
  [/^pg|postgres|postgresql$/i, RateLimitStoreClientType.Postgres],
];

export function resolveStoreClientType(name: string): RateLimitStoreClientType | undefined {
  for (const [regexp, client] of SupportedStoreClientRegexps) {
    if (name.match(regexp)) {
      return client as RateLimitStoreClientType;
    }
  }
}

export function defaultKey(context: RequestContext): string {
  // By default, use the IP address to rate limit users.
  return context.request.ip ?? '0.0.0.0';
}
