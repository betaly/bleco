import {Application, Binding, Component, CoreBindings, inject, ProviderMap} from '@loopback/core';
import {createMiddlewareBinding} from '@loopback/express';
import {SecurityBindings} from '@loopback/security';

import {ConfigAliaser} from './aliaser';
import {AuthenticationBindings} from './keys';
import {ClientAuthenticationMiddlewareProvider, UserAuthenticationMiddlewareProvider} from './middlewares';
import {
  AuthenticateActionProvider,
  AuthMetadataProvider,
  ClientAuthenticateActionProvider,
  ClientAuthMetadataProvider,
} from './providers';
import {
  AppleAuthStrategyFactoryProvider,
  AppleAuthVerifyProvider,
  AuthaStrategyFactoryProvider,
  AuthaVerifyProvider,
  AuthStrategyProvider,
  AzureADAuthStrategyFactoryProvider,
  AzureADAuthVerifyProvider,
  BearerStrategyFactoryProvider,
  BearerTokenVerifyProvider,
  ClientAuthStrategyProvider,
  ClientPasswordStrategyFactoryProvider,
  ClientPasswordVerifyProvider,
  CognitoAuthVerifyProvider,
  CognitoStrategyFactoryProvider,
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
  OtpVerifyProvider,
  PassportOtpStrategyFactoryProvider,
  ResourceOwnerPasswordStrategyFactoryProvider,
  ResourceOwnerVerifyProvider,
  SamlStrategyFactoryProvider,
  SamlVerifyProvider,
  SecureClientPasswordStrategyFactoryProvider,
} from './strategies';
import {Strategies} from './strategies/keys';
import {AuthenticationConfig} from './types';

export class AuthenticationComponent implements Component {
  providers?: ProviderMap;
  bindings?: Binding[];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private readonly app: Application,
    @inject(AuthenticationBindings.CONFIG, {optional: true})
    private readonly config?: AuthenticationConfig,
  ) {
    ConfigAliaser.bind(this.app);
    // Alias loopback security user to AuthenticationBindings.CURRENT_USER
    app.bind(SecurityBindings.USER).toAlias(AuthenticationBindings.CURRENT_USER);
    this.providers = {
      [AuthenticationBindings.USER_AUTH_ACTION.key]: AuthenticateActionProvider,
      [AuthenticationBindings.CLIENT_AUTH_ACTION.key]: ClientAuthenticateActionProvider,
      [AuthenticationBindings.USER_METADATA.key]: AuthMetadataProvider,
      [AuthenticationBindings.CLIENT_METADATA.key]: ClientAuthMetadataProvider,
      [AuthenticationBindings.USER_STRATEGY.key]: AuthStrategyProvider,
      [AuthenticationBindings.CLIENT_STRATEGY.key]: ClientAuthStrategyProvider,

      // Strategy function factories
      [Strategies.Passport.LOCAL_STRATEGY_FACTORY.key]: LocalPasswordStrategyFactoryProvider,
      [Strategies.Passport.OTP_AUTH_STRATEGY_FACTORY.key]: PassportOtpStrategyFactoryProvider,
      [Strategies.Passport.CLIENT_PASSWORD_STRATEGY_FACTORY.key]: ClientPasswordStrategyFactoryProvider,
      [Strategies.Passport.BEARER_STRATEGY_FACTORY.key]: BearerStrategyFactoryProvider,
      [Strategies.Passport.RESOURCE_OWNER_STRATEGY_FACTORY.key]: ResourceOwnerPasswordStrategyFactoryProvider,
      [Strategies.Passport.GOOGLE_OAUTH2_STRATEGY_FACTORY.key]: GoogleAuthStrategyFactoryProvider,
      [Strategies.Passport.SAML_STRATEGY_FACTORY.key]: SamlStrategyFactoryProvider,
      [Strategies.Passport.INSTAGRAM_OAUTH2_STRATEGY_FACTORY.key]: InstagramAuthStrategyFactoryProvider,
      [Strategies.Passport.FACEBOOK_OAUTH2_STRATEGY_FACTORY.key]: FacebookAuthStrategyFactoryProvider,
      [Strategies.Passport.APPLE_OAUTH2_STRATEGY_FACTORY.key]: AppleAuthStrategyFactoryProvider,
      [Strategies.Passport.AZURE_AD_STRATEGY_FACTORY.key]: AzureADAuthStrategyFactoryProvider,
      [Strategies.Passport.KEYCLOAK_STRATEGY_FACTORY.key]: KeycloakStrategyFactoryProvider,
      [Strategies.Passport.COGNITO_OAUTH2_STRATEGY_FACTORY.key]: CognitoStrategyFactoryProvider,
      [Strategies.Passport.AUTHA_STRATEGY_FACTORY.key]: AuthaStrategyFactoryProvider,

      // Verifier functions
      [Strategies.Passport.OAUTH2_CLIENT_PASSWORD_VERIFIER.key]: ClientPasswordVerifyProvider,
      [Strategies.Passport.LOCAL_PASSWORD_VERIFIER.key]: LocalPasswordVerifyProvider,
      [Strategies.Passport.OTP_VERIFIER.key]: OtpVerifyProvider,
      [Strategies.Passport.BEARER_TOKEN_VERIFIER.key]: BearerTokenVerifyProvider,
      [Strategies.Passport.RESOURCE_OWNER_PASSWORD_VERIFIER.key]: ResourceOwnerVerifyProvider,
      [Strategies.Passport.GOOGLE_OAUTH2_VERIFIER.key]: GoogleAuthVerifyProvider,
      [Strategies.Passport.SAML_VERIFIER.key]: SamlVerifyProvider,
      [Strategies.Passport.INSTAGRAM_OAUTH2_VERIFIER.key]: InstagramAuthVerifyProvider,
      [Strategies.Passport.FACEBOOK_OAUTH2_VERIFIER.key]: FacebookAuthVerifyProvider,
      [Strategies.Passport.COGNITO_OAUTH2_VERIFIER.key]: CognitoAuthVerifyProvider,
      [Strategies.Passport.APPLE_OAUTH2_VERIFIER.key]: AppleAuthVerifyProvider,
      [Strategies.Passport.AZURE_AD_VERIFIER.key]: AzureADAuthVerifyProvider,
      [Strategies.Passport.KEYCLOAK_VERIFIER.key]: KeycloakVerifyProvider,
      [Strategies.Passport.AUTHA_VERIFIER.key]: AuthaVerifyProvider,
    };
    if (this.config?.secureClient) {
      this.providers = {
        ...this.providers,
        [Strategies.Passport.CLIENT_PASSWORD_STRATEGY_FACTORY.key]: SecureClientPasswordStrategyFactoryProvider,
      };
    }
    this.bindings = [];
    if (this.config?.useClientAuthenticationMiddleware) {
      this.bindings.push(createMiddlewareBinding(ClientAuthenticationMiddlewareProvider));
    }
    if (this.config?.useUserAuthenticationMiddleware) {
      this.bindings.push(createMiddlewareBinding(UserAuthenticationMiddlewareProvider));
    }
  }
}
