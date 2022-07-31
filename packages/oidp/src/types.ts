import {StoreOptions} from 'kvs';
import {OidcConfiguration} from './types/oidc.types';

export * from './types/oidc.types';

export const OidcDataSourceName = 'OidcDB';
export const OidcDefaultPath = '/oidc';

export interface OidpConfig {
  baseUrl: string;
  path?: string;
  oidc?: OidcConfiguration;
  store?: StoreOptions;
}
