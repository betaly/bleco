import {Provider, inject} from '@loopback/core';
import {Request} from '@loopback/rest';
import {BErrors} from 'berrors';
import {
  IOIDCStrategyOptionWithRequest,
  IOIDCStrategyOptionWithoutRequest,
  IProfile,
  OIDCStrategy,
  VerifyCallback,
} from 'passport-azure-ad';

import {AuthenticationErrors} from '../../../errors';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';

export interface AzureADAuthStrategyFactory {
  (
    options: IOIDCStrategyOptionWithoutRequest | IOIDCStrategyOptionWithRequest,
    verifierPassed?: VerifyFunction.AzureADAuthFn,
  ): OIDCStrategy;
}

export class AzureADAuthStrategyFactoryProvider implements Provider<AzureADAuthStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.AZURE_AD_VERIFIER)
    private readonly verifierAzureADAuth: VerifyFunction.AzureADAuthFn,
  ) {}

  value(): AzureADAuthStrategyFactory {
    return (options, verifier) => this.getAzureADAuthStrategyVerifier(options, verifier);
  }

  getAzureADAuthStrategyVerifier(
    options: IOIDCStrategyOptionWithoutRequest | IOIDCStrategyOptionWithRequest,
    verifierPassed?: VerifyFunction.AzureADAuthFn,
  ): OIDCStrategy {
    const verifyFn = verifierPassed ?? this.verifierAzureADAuth;
    if (options && options.passReqToCallback === true) {
      return new OIDCStrategy(
        options,

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          req: Request,
          iss: string,
          sub: string,
          profile: IProfile,
          accessToken: string,
          refreshToken: string,
          done: VerifyCallback,
        ) => {
          if (!profile.oid) {
            return done(new Error('No oid found'), null);
          }

          try {
            const user = await verifyFn(accessToken, refreshToken, profile, done, req);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            done(null, user);
          } catch (err) {
            done(err);
          }
        },
      );
    } else if (options && options.passReqToCallback === false) {
      return new OIDCStrategy(
        options,

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          iss: string,
          sub: string,
          profile: IProfile,
          accessToken: string,
          refreshToken: string,
          done: VerifyCallback,
        ) => {
          if (!profile.oid) {
            return done(new Error('No oid found'), null);
          }

          try {
            const user = await verifyFn(accessToken, refreshToken, profile, done);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            done(null, user);
          } catch (err) {
            done(err);
          }
        },
      );
    } else {
      throw new Error('Invalid value for passReqToCallback');
    }
  }
}
