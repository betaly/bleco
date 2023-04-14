import {BindingKey} from '@loopback/core';

import {SamlStrategyFactoryProvider} from './SAML';
import {InstagramAuthStrategyFactoryProvider} from './passport';
import {AppleAuthStrategyFactoryProvider} from './passport/passport-apple-oauth2';
import {AzureADAuthStrategyFactoryProvider} from './passport/passport-azure-ad';
import {BearerStrategyFactory} from './passport/passport-bearer';
import {ClientPasswordStrategyFactory} from './passport/passport-client-password/client-password-strategy-factory-provider';
import {CognitoStrategyFactoryProvider} from './passport/passport-cognito-oauth2';
import {FacebookAuthStrategyFactoryProvider} from './passport/passport-facebook-oauth2';
import {GoogleAuthStrategyFactoryProvider} from './passport/passport-google-oauth2';
import {KeycloakStrategyFactoryProvider} from './passport/passport-keycloak';
import {LocalPasswordStrategyFactory} from './passport/passport-local';
import {ResourceOwnerPasswordStrategyFactory} from './passport/passport-resource-owner-password';
import {VerifyFunction} from './types';

export namespace Strategies {
  export namespace Passport {
    // Passport-local strategy
    export const LOCAL_STRATEGY_FACTORY = BindingKey.create<LocalPasswordStrategyFactory>(
      'bleco.passport.strategyFactory.localPassword',
    );
    export const LOCAL_PASSWORD_VERIFIER = BindingKey.create<VerifyFunction.LocalPasswordFn>(
      'bleco.passport.verifier.localPassword',
    );

    // Passport-local-with-otp startegy
    export const OTP_AUTH_STRATEGY_FACTORY = BindingKey.create<LocalPasswordStrategyFactory>(
      'bleco.passport.strategyFactory.otpAuth',
    );
    export const OTP_VERIFIER = BindingKey.create<VerifyFunction.LocalPasswordFn>('bleco.passport.verifier.otpAuth');

    // Passport-oauth2-client-password strategy
    export const CLIENT_PASSWORD_STRATEGY_FACTORY = BindingKey.create<ClientPasswordStrategyFactory>(
      'bleco.passport.strategyFactory.clientPassword',
    );
    export const OAUTH2_CLIENT_PASSWORD_VERIFIER = BindingKey.create<VerifyFunction.OauthClientPasswordFn>(
      'bleco.passport.verifier.oauth2ClientPassword',
    );

    // Passport-bearer strategy
    export const BEARER_STRATEGY_FACTORY = BindingKey.create<BearerStrategyFactory>(
      'bleco.passport.strategyFactory.bearer',
    );
    export const BEARER_TOKEN_VERIFIER = BindingKey.create<VerifyFunction.BearerFn>(
      'bleco.passport.verifier.bearerToken',
    );

    // Passport-oauth2-resource-owner-password strategy
    export const RESOURCE_OWNER_STRATEGY_FACTORY = BindingKey.create<ResourceOwnerPasswordStrategyFactory>(
      'bleco.passport.strategyFactory.resourceOwnerPassword',
    );
    export const RESOURCE_OWNER_PASSWORD_VERIFIER = BindingKey.create<VerifyFunction.ResourceOwnerPasswordFn>(
      'bleco.passport.verifier.resourceOwnerPassword',
    );

    // Passport-google-oauth2 strategy
    export const GOOGLE_OAUTH2_STRATEGY_FACTORY = BindingKey.create<GoogleAuthStrategyFactoryProvider>(
      'bleco.passport.strategyFactory.googleOauth2',
    );
    export const GOOGLE_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.GoogleAuthFn>(
      'bleco.passport.verifier.googleOauth2',
    );

    export const AZURE_AD_STRATEGY_FACTORY = BindingKey.create<AzureADAuthStrategyFactoryProvider>(
      'bleco.passport.strategyFactory.azureAd',
    );
    export const AZURE_AD_VERIFIER = BindingKey.create<VerifyFunction.AzureADAuthFn>('bleco.passport.verifier.azureAd');

    // Passport-keycloak strategy
    export const KEYCLOAK_STRATEGY_FACTORY = BindingKey.create<KeycloakStrategyFactoryProvider>(
      'bleco.passport.strategyFactory.keycloak',
    );
    export const KEYCLOAK_VERIFIER = BindingKey.create<VerifyFunction.KeycloakAuthFn>(
      'bleco.passport.verifier.keycloak',
    );

    // Passport-instagram startegy
    export const INSTAGRAM_OAUTH2_STRATEGY_FACTORY = BindingKey.create<InstagramAuthStrategyFactoryProvider>(
      'bleco.passport.strategyFactory.instagramOauth2',
    );
    export const INSTAGRAM_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.InstagramAuthFn>(
      'bleco.passport.verifier.instagramOauth2',
    );

    // Passport-facebook startegy
    export const FACEBOOK_OAUTH2_STRATEGY_FACTORY = BindingKey.create<FacebookAuthStrategyFactoryProvider>(
      'bleco.passport.strategyFactory.facebookOauth2',
    );
    export const FACEBOOK_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.FacebookAuthFn>(
      'bleco.passport.verifier.facebookOauth2',
    );

    // Passport-apple-oauth2 strategy
    export const APPLE_OAUTH2_STRATEGY_FACTORY = BindingKey.create<AppleAuthStrategyFactoryProvider>(
      'bleco.passport.strategyFactory.appleOauth2',
    );
    export const APPLE_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.AppleAuthFn>(
      'bleco.passport.verifier.appleOauth2',
    );

    // Passport-cognito-oauth2 strategy
    export const COGNITO_OAUTH2_STRATEGY_FACTORY = BindingKey.create<CognitoStrategyFactoryProvider>(
      'bleco.passport.strategyFactory.cognitoOauth2',
    );
    export const COGNITO_OAUTH2_VERIFIER = BindingKey.create<VerifyFunction.CognitoAuthFn>(
      'bleco.passport.verifier.cognitoOauth2',
    );
    // SAML strategy
    export const SAML_STRATEGY_FACTORY = BindingKey.create<SamlStrategyFactoryProvider>(
      'bleco.passport.strategyFactory.saml',
    );
    export const SAML_VERIFIER = BindingKey.create<VerifyFunction.SamlFn>('bleco.passport.verifier.saml');
  }
}
