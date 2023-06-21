import {inject, Provider} from '@loopback/core';
import {Request} from '@loopback/rest';
import {HttpsProxyAgent} from 'https-proxy-agent';
import {Profile, Strategy, StrategyOptions, StrategyOptionsWithRequest, VerifyCallback} from '@authajs/passport-autha';

import {AuthenticationErrors} from '../../../errors';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';

export interface AuthaStrategyFactory {
  (options: Partial<StrategyOptions | StrategyOptionsWithRequest>, verifierPassed?: VerifyFunction.AuthaFn): Strategy;
}

export class AuthaStrategyFactoryProvider implements Provider<AuthaStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.AUTHA_VERIFIER)
    private readonly verifierAutha: VerifyFunction.AuthaFn,
    @inject(Strategies.Passport.AUTHA_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: StrategyOptions | StrategyOptionsWithRequest,
  ) {}

  value(): AuthaStrategyFactory {
    return (options, verifier) => this.getAuthaStrategyVerifier(options, verifier);
  }

  getAuthaStrategyVerifier(
    options: Partial<StrategyOptions | StrategyOptionsWithRequest>,
    verifierPassed?: VerifyFunction.AuthaFn,
  ): Strategy {
    options = {...this.options, ...options};
    options.clientID = options.clientID ?? (options as {clientId: string}).clientId;
    const verifyFn = verifierPassed ?? this.verifierAutha;
    let strategy;
    if (options.passReqToCallback === true) {
      strategy = new Strategy(
        options as StrategyOptionsWithRequest,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (req: Request, accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) => {
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
      );
    } else {
      strategy = new Strategy(
        options as StrategyOptions,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) => {
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
