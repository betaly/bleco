import {Provider, inject} from '@loopback/core';
import {Request} from '@loopback/rest';
import {isEmpty} from 'lodash';
import * as PassportBearer from 'passport-http-bearer';

import {AuthenticationErrors} from '../../../errors';
import {IAuthUser} from '../../../types';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';

export interface BearerStrategyFactory {
  (
    options?: PassportBearer.IStrategyOptions,
    verifierPassed?: VerifyFunction.BearerFn,
  ): PassportBearer.Strategy<VerifyFunction.BearerFn>;
}

export class BearerStrategyFactoryProvider implements Provider<BearerStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.BEARER_TOKEN_VERIFIER)
    private readonly verifierBearer: VerifyFunction.BearerFn,
    @inject(Strategies.Passport.BEARER_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: PassportBearer.IStrategyOptions,
  ) {}

  value(): BearerStrategyFactory {
    return (options, verifier) => this.getBearerStrategyVerifier(options, verifier);
  }

  getBearerStrategyVerifier(
    options?: PassportBearer.IStrategyOptions,
    verifierPassed?: VerifyFunction.BearerFn,
  ): PassportBearer.Strategy<VerifyFunction.BearerFn> {
    options = {...this.options, ...options};
    const verifyFn = verifierPassed ?? this.verifierBearer;
    if (options?.passReqToCallback) {
      return new PassportBearer.Strategy(
        options,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (req: Request, token: string, cb: (err: Error | null, user?: IAuthUser | false) => void) => {
          try {
            const user = await verifyFn(token, req);
            if (!user) {
              throw new AuthenticationErrors.TokenInvalid();
            }
            cb(null, user);
          } catch (err) {
            cb(err);
          }
        },
      );
    } else if (!!options && !isEmpty(options)) {
      return new PassportBearer.Strategy(
        options,

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (token: string, cb: (err: Error | null, user?: IAuthUser | false) => void) => {
          try {
            const user = await verifyFn(token);
            if (!user) {
              throw new AuthenticationErrors.TokenInvalid();
            }
            cb(null, user);
          } catch (err) {
            cb(err);
          }
        },
      );
    } else {
      return new PassportBearer.Strategy(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (token: string, cb: (err: Error | null, user?: IAuthUser | false) => void) => {
          try {
            const user = await verifyFn(token);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            cb(null, user);
          } catch (err) {
            cb(err);
          }
        },
      );
    }
  }
}
