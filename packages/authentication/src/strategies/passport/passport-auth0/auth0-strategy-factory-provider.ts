import {Provider} from '@loopback/context';
import {VerifyCallback, VerifyFunction} from '../../types';
import {ExtraVerificationParams, Profile, Strategy, StrategyOption, StrategyOptionWithRequest} from 'passport-auth0';
import {inject} from '@loopback/core';
import {Strategies} from '../../keys';
import {HttpsProxyAgent} from 'https-proxy-agent';
import {Request} from '@loopback/rest';
import {AuthenticationErrors} from '../../../errors';

export type Auth0Strategy = Strategy & {
  options: StrategyOption | StrategyOptionWithRequest;
};

export interface Auth0StrategyFactory {
  (
    options: Partial<StrategyOption | StrategyOptionWithRequest>,
    verifierPassed?: VerifyFunction.AuthaFn,
  ): Auth0Strategy;
}

export class Auth0StrategyFactoryProvider implements Provider<Auth0StrategyFactory> {
  constructor(
    @inject(Strategies.Passport.AUTH0_VERIFIER)
    private readonly verifierAuth0: VerifyFunction.Auth0AuthFn,
    @inject(Strategies.Passport.AUTH0_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: StrategyOption | StrategyOptionWithRequest,
  ) {}

  value(): Auth0StrategyFactory {
    return (options, verifier) => this.getStrategyVerifier(options, verifier);
  }

  getStrategyVerifier(
    options: Partial<StrategyOption | StrategyOptionWithRequest>,
    verifierPassed?: VerifyFunction.AuthaFn,
  ): Auth0Strategy {
    options = {...this.options, ...options};
    options.clientID = options.clientID ?? (options as {clientId: string}).clientId;
    const verifyFn = verifierPassed ?? this.verifierAuth0;
    let strategy: Auth0Strategy;
    if ((options as StrategyOptionWithRequest).passReqToCallback) {
      strategy = new Strategy(
        options as StrategyOptionWithRequest,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          req: Request,
          accessToken: string,
          refreshToken: string,
          extraParams: ExtraVerificationParams,
          profile: Profile,
          cb: VerifyCallback,
        ) => {
          try {
            const user = await verifyFn(accessToken, refreshToken, profile, cb, req);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            cb(undefined, user);
          } catch (err) {
            cb(err);
          }
        },
      ) as Auth0Strategy;
    } else {
      strategy = new Strategy(
        options as StrategyOption,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          accessToken: string,
          refreshToken: string,
          extraParams: ExtraVerificationParams,
          profile: Profile,
          cb: VerifyCallback,
        ) => {
          try {
            const user = await verifyFn(accessToken, refreshToken, profile, cb);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            cb(undefined, user);
          } catch (err) {
            cb(err);
          }
        },
      ) as Auth0Strategy;
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
