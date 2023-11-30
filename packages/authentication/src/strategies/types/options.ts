import * as AuthaStrategy from '@authajs/passport-autha';
import * as SamlStrategy from '@node-saml/passport-saml';
import * as AppleStrategy from 'passport-apple';
import * as AzureADStrategy from 'passport-azure-ad';
import * as FacebookStrategy from 'passport-facebook';
import * as GoogleStrategy from 'passport-google-oauth20';
import * as PassportBearer from 'passport-http-bearer';
import * as InstagramStrategy from 'passport-instagram';
import * as PassportLocal from 'passport-local';
import * as Auth0Strategy from 'passport-auth0';

import * as ClientPassportStrategy from '../passport/passport-client-password/client-password-strategy';
import {Otp} from '../passport/passport-otp/otp-auth';
import {Oauth2ResourceOwnerPassword} from '../passport/passport-resource-owner-password/oauth2-resource-owner-password-grant';
import {Cognito} from './cognito.types';
import {Keycloak} from './keycloak.types';

export type BearerStrategyOptions = PassportBearer.IStrategyOptions;
export type AuthaStrategyOptions = AuthaStrategy.StrategyOptions | AuthaStrategy.StrategyOptionsWithRequest;
export type AppleStrategyOptions = AppleStrategy.AuthenticateOptions | AppleStrategy.AuthenticateOptionsWithRequest;
export type AzureADStrategyOptions =
  | AzureADStrategy.IOIDCStrategyOptionWithoutRequest
  | AzureADStrategy.IOIDCStrategyOptionWithRequest;
export type FacebookStrategyOptions =
  | (FacebookStrategy.StrategyOptions & {passReqToCallback?: false})
  | FacebookStrategy.StrategyOptionsWithRequest;
export type GoogleStrategyOptions = GoogleStrategy.StrategyOptions | GoogleStrategy.StrategyOptionsWithRequest;
export type KeycloakStrategyOptions = Keycloak.StrategyOptions & {passReqToCallback?: boolean};
export type InstagramStrategyOptions = InstagramStrategy.StrategyOption | InstagramStrategy.StrategyOptionWithRequest;
export type ClientPassportStrategyOptions = ClientPassportStrategy.StrategyOptionsWithRequestInterface;
export type LocalStrategyOptions = PassportLocal.IStrategyOptions | PassportLocal.IStrategyOptionsWithRequest;
export type ResourceOwnerPasswordStrategyOptions = Oauth2ResourceOwnerPassword.StrategyOptionsWithRequestInterface;
export type OtpStrategyOptions = Otp.StrategyOptions;
export type SamlStrategyOptions = SamlStrategy.SamlConfig;
export type CognitoStrategyOptions = Cognito.StrategyOptions;
export type Auth0StrategyOptions = Auth0Strategy.StrategyOption;
