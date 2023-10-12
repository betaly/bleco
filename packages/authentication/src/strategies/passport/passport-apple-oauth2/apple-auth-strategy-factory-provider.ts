import {inject, Provider} from '@loopback/core';
import {Request} from '@loopback/rest';
import {HttpsProxyAgent} from 'https-proxy-agent';
import Strategy, {AuthenticateOptions, AuthenticateOptionsWithRequest, Profile, VerifyCallback} from 'passport-apple';

import {AuthenticationErrors} from '../../../errors';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';

export interface AppleAuthStrategyFactory {
  (
    options: AuthenticateOptions | AuthenticateOptionsWithRequest,
    verifierPassed?: VerifyFunction.AppleAuthFn,
  ): Strategy;
}

export class AppleAuthStrategyFactoryProvider implements Provider<AppleAuthStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.APPLE_OAUTH2_VERIFIER)
    private readonly verifierAppleAuth: VerifyFunction.AppleAuthFn,
    @inject(Strategies.Passport.APPLE_OAUTH2_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: AuthenticateOptions | AuthenticateOptionsWithRequest,
  ) {}

  value(): AppleAuthStrategyFactory {
    return (options, verifier) => this.getAppleAuthStrategyVerifier(options, verifier);
  }

  getAppleAuthStrategyVerifier(
    options: AuthenticateOptions | AuthenticateOptionsWithRequest,
    verifierPassed?: VerifyFunction.AppleAuthFn,
  ): Strategy {
    options = {...this.options, ...options};
    const verifyFn = verifierPassed ?? this.verifierAppleAuth;
    let strategy;
    if (options.passReqToCallback === false) {
      strategy = new Strategy(
        options,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (accessToken: string, refreshToken: string, idToken: string, profile: Profile, cb: VerifyCallback) => {
          try {
            const user = await verifyFn(accessToken, refreshToken, idToken, profile, cb);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            cb(undefined, user);
          } catch (err) {
            cb(err);
          }
        },
      );
    } else {
      strategy = new Strategy(
        options,

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          req: Request,
          accessToken: string,
          refreshToken: string,
          idToken: string,
          profile: Profile,
          cb: VerifyCallback,
        ) => {
          try {
            const user = await verifyFn(accessToken, refreshToken, idToken, profile, cb, req);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            cb(undefined, user);
          } catch (err) {
            cb(err);
          }
        },
      );
    }

    this._setupProxy(strategy);
    return strategy;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _setupProxy(strategy: any) {
    // Setup proxy if any
    let httpsProxyAgent;
    if (process.env['https_proxy']) {
      httpsProxyAgent = new HttpsProxyAgent(process.env['https_proxy']);
      strategy._oauth2.setAgent(httpsProxyAgent);
    } else if (process.env['HTTPS_PROXY']) {
      httpsProxyAgent = new HttpsProxyAgent(process.env['HTTPS_PROXY']);
      strategy._oauth2.setAgent(httpsProxyAgent);
    }
  }
}
