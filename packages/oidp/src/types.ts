import {StoreOptions} from 'kvs';
import * as oidc from 'oidc-provider';

export * from './types/oidc.types';

/* RE-EXPORT oidc-provider types */
export type OidcProvider = oidc.Provider;
export type OidcAdapterFactory = oidc.AdapterFactory;
export type OidcConfiguration = oidc.Configuration;
export type OidcFindAccount = oidc.FindAccount;
export const OidcProvider = oidc.Provider;

//
export const OidcDataSourceName = 'OidcDB';
export const OidcDefaultPath = '/oidc';

export interface OidpConfig {
  baseUrl: string;
  path?: string;
  oidc?: OidcConfiguration;
  store?: StoreOptions;
}
