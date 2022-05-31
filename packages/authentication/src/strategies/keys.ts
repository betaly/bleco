import {BindingKey} from '@loopback/core';
import {
  AppleAuthStrategyFactoryProvider,
  AzureADAuthStrategyFactoryProvider,
  BearerStrategyFactory,
  ClientPasswordStrategyFactory,
  FacebookAuthStrategyFactoryProvider,
  GoogleAuthStrategyFactoryProvider,
  InstagramAuthStrategyFactoryProvider,
  KeycloakStrategyFactoryProvider,
  LocalPasswordStrategyFactory,
  ResourceOwnerPasswordStrategyFactory,
} from './passport';
import {VerifyFunction} from './types';

export namespace Strategies {
  export namespace Passport {
    // Passport-local strategy
    export const LOCAL_STRATEGY_FACTORY = BindingKey.create<LocalPasswordStrategyFactory>(
      'eco.passport.strategyFactory.localPassword',
    );
    export const LOCAL_PASSWORD_VERIFIER = BindingKey.create<VerifyFunction.LocalPasswordFn>(
      'eco.passport.verifier.localPassword',
    );

    // Passport-oauth2-client-password strategy
    export const CLIENT_PASSWORD_STRATEGY_FACTORY = BindingKey.create<ClientPasswordStrategyFactory>(
      'eco.passport.strategyFactory.clientPassword',
    );
    export const OAUTH2_CLIENT_PASSWORD_VERIFIER = BindingKey.create<VerifyFunction.OauthClientPasswordFn>(
      'eco.passport.verifier.oauth2ClientPassword',
    );

    // Passport-bearer strategy
    export const BEARER_STRATEGY_FACTORY = BindingKey.create<BearerStrategyFactory>(
      'eco.passport.strategyFactory.bearer',
    );
    export const BEARER_TOKEN_VERIFIER = BindingKey.create<VerifyFunction.BearerFn>(
      'eco.passport.verifier.bearerToken',
    );

    // Passport-oauth2-resource-owner-password strategy
    export const RESOURCE_OWNER_STRATEGY_FACTORY = BindingKey.create<ResourceOwnerPasswordStrategyFactory>(
      'eco.passport.strategyFactory.resourceOwnerPassword',
    );
    export const RESOURCE_OWNER_PASSWORD_VERIFIER = BindingKey.create<VerifyFunction.ResourceOwnerPasswordFn>(
      'eco.passport.verifier.resourceOwnerPassword',
    );

    // Passport-google-oauth2 strategy
    export const GOOGLE_OAUTH2_STRATEGY_FACTORY = BindingKey.create<GoogleAuthStrategyFactoryProvider>(
      'eco.passport.strategyFactory.googleOauth2',
    );
    export const GOOGLE_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.GoogleAuthFn>(
      'eco.passport.verifier.googleOauth2',
    );

    export const AZURE_AD_STRATEGY_FACTORY = BindingKey.create<AzureADAuthStrategyFactoryProvider>(
      'eco.passport.strategyFactory.azureAd',
    );
    export const AZURE_AD_VERIFIER = BindingKey.create<VerifyFunction.AzureADAuthFn>('eco.passport.verifier.azureAd');

    // Passport-keycloak strategy
    export const KEYCLOAK_STRATEGY_FACTORY = BindingKey.create<KeycloakStrategyFactoryProvider>(
      'eco.passport.strategyFactory.keycloak',
    );
    export const KEYCLOAK_VERIFIER = BindingKey.create<VerifyFunction.KeycloakAuthFn>('eco.passport.verifier.keycloak');

    // Passport-instagram strategy
    export const INSTAGRAM_OAUTH2_STRATEGY_FACTORY = BindingKey.create<InstagramAuthStrategyFactoryProvider>(
      'eco.passport.strategyFactory.instagramOauth2',
    );
    export const INSTAGRAM_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.InstagramAuthFn>(
      'eco.passport.verifier.instagramOauth2',
    );

    // Passport-facebook strategy
    export const FACEBOOK_OAUTH2_STRATEGY_FACTORY = BindingKey.create<FacebookAuthStrategyFactoryProvider>(
      'eco.passport.strategyFactory.facebookOauth2',
    );
    export const FACEBOOK_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.FacebookAuthFn>(
      'eco.passport.verifier.facebookOauth2',
    );

    // Passport-apple-oauth2 strategy
    export const APPLE_OAUTH2_STRATEGY_FACTORY = BindingKey.create<AppleAuthStrategyFactoryProvider>(
      'eco.passport.strategyFactory.appleOauth2',
    );
    export const APPLE_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.AppleAuthFn>(
      'eco.passport.verifier.appleOauth2',
    );
  }
}
