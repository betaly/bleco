import Provider, * as oidc from 'oidc-provider';

export * from 'oidc-provider';

//===================================//
//  MISSING NON-EXPORTED OIDC TYPES  //
//===================================//

/* RE-EXPORT oidc-provider types */
export type OidcProvider = Provider;
export type OidcConfiguration = oidc.Configuration;

// RE-EXPORT oidc-provider class
export const OidcProvider = Provider;

export type Session = Awaited<ReturnType<(typeof OidcProvider.prototype)['Session']['get']>>;

export type InteractionDetails = Awaited<ReturnType<(typeof OidcProvider.prototype)['interactionDetails']>>;

export type Grant = Awaited<ReturnType<NonNullable<oidc.Configuration['loadExistingGrant']>>>;

export type LoadExistingGrant = (ctx: oidc.KoaContextWithOIDC) => oidc.CanBePromise<Grant | undefined>;
