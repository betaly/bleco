import {BindingKey} from '@loopback/core';

import {Strategies} from './keys';
import {
  AppleStrategyOptions,
  Auth0StrategyOptions,
  AuthaStrategyOptions,
  AzureADStrategyOptions,
  BearerStrategyOptions,
  ClientPassportStrategyOptions,
  CognitoStrategyOptions,
  FacebookStrategyOptions,
  GoogleStrategyOptions,
  InstagramStrategyOptions,
  KeycloakStrategyOptions,
  LocalStrategyOptions,
  OtpStrategyOptions,
  ResourceOwnerPasswordStrategyOptions,
  SamlStrategyOptions,
} from './types';

export type StrategiesOptions = {
  apple?: AppleStrategyOptions;
  autha?: AuthaStrategyOptions;
  azure_ad?: AzureADStrategyOptions;
  bearer?: BearerStrategyOptions;
  client_password?: ClientPassportStrategyOptions;
  cognito?: CognitoStrategyOptions;
  facebook?: FacebookStrategyOptions;
  google?: GoogleStrategyOptions;
  instagram?: InstagramStrategyOptions;
  keycloak?: KeycloakStrategyOptions;
  local?: LocalStrategyOptions;
  otp?: OtpStrategyOptions;
  resource_owner_password?: ResourceOwnerPasswordStrategyOptions;
  saml?: SamlStrategyOptions;
  auth0?: Auth0StrategyOptions;
};

export type StrategiesNames = keyof StrategiesOptions;

export const StrategiesOptionsMetadata: Record<StrategiesNames, BindingKey<StrategiesOptions[StrategiesNames]>> = {
  apple: Strategies.Passport.APPLE_OAUTH2_STRATEGY_OPTIONS,
  autha: Strategies.Passport.AUTHA_STRATEGY_OPTIONS,
  azure_ad: Strategies.Passport.AZURE_AD_STRATEGY_OPTIONS,
  bearer: Strategies.Passport.BEARER_STRATEGY_OPTIONS,
  client_password: Strategies.Passport.CLIENT_PASSWORD_STRATEGY_OPTIONS,
  cognito: Strategies.Passport.COGNITO_OAUTH2_STRATEGY_OPTIONS,
  facebook: Strategies.Passport.FACEBOOK_OAUTH2_STRATEGY_OPTIONS,
  google: Strategies.Passport.GOOGLE_OAUTH2_STRATEGY_OPTIONS,
  instagram: Strategies.Passport.INSTAGRAM_OAUTH2_STRATEGY_OPTIONS,
  keycloak: Strategies.Passport.KEYCLOAK_STRATEGY_OPTIONS,
  local: Strategies.Passport.LOCAL_STRATEGY_OPTIONS,
  otp: Strategies.Passport.OTP_AUTH_STRATEGY_OPTIONS,
  resource_owner_password: Strategies.Passport.RESOURCE_OWNER_STRATEGY_OPTIONS,
  saml: Strategies.Passport.SAML_STRATEGY_OPTIONS,
  auth0: Strategies.Passport.AUTH0_STRATEGY_OPTIONS,
};
