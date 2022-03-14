import {Application, Component, CoreBindings, inject, ProviderMap} from '@loopback/core';

import {AuthenticationBindings} from './keys';
import {
  AuthenticateActionProvider,
  AuthMetadataProvider,
  ClientAuthenticateActionProvider,
  ClientAuthMetadataProvider,
} from './providers';
import {
  AppleAuthStrategyFactoryProvider,
  AppleAuthVerifyProvider,
  AuthStrategyProvider,
  AzureADAuthStrategyFactoryProvider,
  AzureADAuthVerifyProvider,
  BearerStrategyFactoryProvider,
  BearerTokenVerifyProvider,
  ClientAuthStrategyProvider,
  ClientPasswordStrategyFactoryProvider,
  ClientPasswordVerifyProvider,
  FacebookAuthStrategyFactoryProvider,
  FacebookAuthVerifyProvider,
  GoogleAuthStrategyFactoryProvider,
  GoogleAuthVerifyProvider,
  InstagramAuthStrategyFactoryProvider,
  InstagramAuthVerifyProvider,
  KeycloakStrategyFactoryProvider,
  KeycloakVerifyProvider,
  LocalPasswordStrategyFactoryProvider,
  LocalPasswordVerifyProvider,
  ResourceOwnerPasswordStrategyFactoryProvider,
  ResourceOwnerVerifyProvider,
  Strategies,
} from './strategies';
import {StrategiesAliaser} from './alias';

export class AuthenticationComponent implements Component {
  providers?: ProviderMap = {
    [AuthenticationBindings.USER_AUTH_ACTION.key]: AuthenticateActionProvider,
    [AuthenticationBindings.CLIENT_AUTH_ACTION.key]: ClientAuthenticateActionProvider,
    [AuthenticationBindings.USER_METADATA.key]: AuthMetadataProvider,
    [AuthenticationBindings.CLIENT_METADATA.key]: ClientAuthMetadataProvider,
    [AuthenticationBindings.USER_STRATEGY.key]: AuthStrategyProvider,
    [AuthenticationBindings.CLIENT_STRATEGY.key]: ClientAuthStrategyProvider,

    // Strategy function factories
    [Strategies.Passport.LOCAL_STRATEGY_FACTORY.key]: LocalPasswordStrategyFactoryProvider,
    [Strategies.Passport.CLIENT_PASSWORD_STRATEGY_FACTORY.key]: ClientPasswordStrategyFactoryProvider,
    [Strategies.Passport.BEARER_STRATEGY_FACTORY.key]: BearerStrategyFactoryProvider,
    [Strategies.Passport.RESOURCE_OWNER_STRATEGY_FACTORY.key]: ResourceOwnerPasswordStrategyFactoryProvider,
    [Strategies.Passport.GOOGLE_OAUTH2_STRATEGY_FACTORY.key]: GoogleAuthStrategyFactoryProvider,
    [Strategies.Passport.INSTAGRAM_OAUTH2_STRATEGY_FACTORY.key]: InstagramAuthStrategyFactoryProvider,
    [Strategies.Passport.FACEBOOK_OAUTH2_STRATEGY_FACTORY.key]: FacebookAuthStrategyFactoryProvider,
    [Strategies.Passport.APPLE_OAUTH2_STRATEGY_FACTORY.key]: AppleAuthStrategyFactoryProvider,
    [Strategies.Passport.AZURE_AD_STRATEGY_FACTORY.key]: AzureADAuthStrategyFactoryProvider,
    [Strategies.Passport.KEYCLOAK_STRATEGY_FACTORY.key]: KeycloakStrategyFactoryProvider,

    // Verifier functions
    [Strategies.Passport.OAUTH2_CLIENT_PASSWORD_VERIFIER.key]: ClientPasswordVerifyProvider,
    [Strategies.Passport.LOCAL_PASSWORD_VERIFIER.key]: LocalPasswordVerifyProvider,
    [Strategies.Passport.BEARER_TOKEN_VERIFIER.key]: BearerTokenVerifyProvider,
    [Strategies.Passport.RESOURCE_OWNER_PASSWORD_VERIFIER.key]: ResourceOwnerVerifyProvider,
    [Strategies.Passport.GOOGLE_OAUTH2_VERIFIER.key]: GoogleAuthVerifyProvider,
    [Strategies.Passport.INSTAGRAM_OAUTH2_VERIFIER.key]: InstagramAuthVerifyProvider,
    [Strategies.Passport.FACEBOOK_OAUTH2_VERIFIER.key]: FacebookAuthVerifyProvider,
    [Strategies.Passport.APPLE_OAUTH2_VERIFIER.key]: AppleAuthVerifyProvider,
    [Strategies.Passport.AZURE_AD_VERIFIER.key]: AzureADAuthVerifyProvider,
    [Strategies.Passport.KEYCLOAK_VERIFIER.key]: KeycloakVerifyProvider,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,
  ) {
    StrategiesAliaser.alias(app);
  }
}
