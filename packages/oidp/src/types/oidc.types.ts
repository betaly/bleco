import * as oidc from 'oidc-provider';

//===================================//
//  MISSING NON-EXPORTED OIDC TYPES  //
//===================================//

type SessionPromise = ReturnType<typeof oidc.Provider.prototype['Session']['get']>;
export type Session = SessionPromise extends Promise<infer T> ? T : SessionPromise;

type InteractionDetailsPromise = ReturnType<typeof oidc.Provider.prototype['interactionDetails']>;
export type InteractionDetails = InteractionDetailsPromise extends Promise<infer T> ? T : InteractionDetailsPromise;

/* RE-EXPORT oidc-provider types */
export type OidcProvider = oidc.Provider;
export type OidcAdapterFactory = oidc.AdapterFactory;
export type OidcConfiguration = oidc.Configuration;
export type OidcFindAccount = oidc.FindAccount;

// RE-EXPORT oidc-provider class
export const OidcProvider = oidc.Provider;
