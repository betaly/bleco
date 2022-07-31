import * as oidc from 'oidc-provider';

export * from 'oidc-provider';

//===================================//
//  MISSING NON-EXPORTED OIDC TYPES  //
//===================================//

export type Session = Awaited<ReturnType<typeof oidc.Provider.prototype['Session']['get']>>;

export type InteractionDetails = Awaited<ReturnType<typeof oidc.Provider.prototype['interactionDetails']>>;

export type Grant = Awaited<ReturnType<NonNullable<oidc.Configuration['loadExistingGrant']>>>;

export type LoadExistingGrant = (ctx: oidc.KoaContextWithOIDC) => oidc.CanBePromise<Grant | undefined>;

/* RE-EXPORT oidc-provider types */
export type OidcProvider = oidc.Provider;
export type OidcConfiguration = oidc.Configuration;

// RE-EXPORT oidc-provider class
export const OidcProvider = oidc.Provider;
