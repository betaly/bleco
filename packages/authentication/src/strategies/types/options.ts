import * as AuthaStrategy from '@authajs/passport-autha';
import * as SamlStrategy from '@node-saml/passport-saml';
import * as AppleStrategy from 'passport-apple';
import * as AzureADStrategy from 'passport-azure-ad';
import * as FacebookStrategy from 'passport-facebook';
import * as GoogleStrategy from 'passport-google-oauth20';
import * as InstagramStrategy from 'passport-instagram';
import * as ClientPassportStrategy from '../passport/passport-client-password/client-password-strategy';
import * as PassportLocal from 'passport-local';
import {Oauth2ResourceOwnerPassword} from '../passport/passport-resource-owner-password/oauth2-resource-owner-password-grant';
import {Otp} from '../passport/passport-otp/otp-auth';
import * as PassportBearer from 'passport-http-bearer';
import {Keycloak} from './keycloak.types';
import {Cognito} from './cognito.types';

export type BearerStrategyOptions = PassportBearer.IStrategyOptions;
export type AuthaStrategyOptions = AuthaStrategy.StrategyOptions | AuthaStrategy.StrategyOptionsWithRequest;
export type AppleStrategyOptions = AppleStrategy.AuthenticateOptions | AppleStrategy.AuthenticateOptionsWithRequest;
export type AzureADStrategyOptions =
  | AzureADStrategy.IOIDCStrategyOptionWithoutRequest
  | AzureADStrategy.IOIDCStrategyOptionWithRequest;
export type FacebookStrategyOptions =
  | (FacebookStrategy.StrategyOption & {passReqToCallback?: false})
  | FacebookStrategy.StrategyOptionWithRequest;
export type GoogleStrategyOptions = GoogleStrategy.StrategyOptions | GoogleStrategy.StrategyOptionsWithRequest;
export type KeycloakStrategyOptions = Keycloak.StrategyOptions & {passReqToCallback?: boolean};
export type InstagramStrategyOptions = InstagramStrategy.StrategyOption | InstagramStrategy.StrategyOptionWithRequest;
export type ClientPassportStrategyOptions = ClientPassportStrategy.StrategyOptionsWithRequestInterface;
export type LocalStrategyOptions = PassportLocal.IStrategyOptions | PassportLocal.IStrategyOptionsWithRequest;
export type ResourceOwnerPasswordStrategyOptions = Oauth2ResourceOwnerPassword.StrategyOptionsWithRequestInterface;
export type OtpStrategyOptions = Otp.StrategyOptions;
export type SamlStrategyOptions = SamlStrategy.SamlConfig;
export type CognitoStrategyOptions = Cognito.StrategyOptions;
