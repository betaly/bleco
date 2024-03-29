import {Provider, inject} from '@loopback/core';
import {Request} from '@loopback/rest';
import {isEmpty} from 'lodash';
import * as PassportLocal from 'passport-local';

import {AuthenticationErrors} from '../../../errors';
import {IAuthUser} from '../../../types';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';

export interface LocalPasswordStrategyFactory {
  (
    options?: PassportLocal.IStrategyOptions | PassportLocal.IStrategyOptionsWithRequest,
    verifierPassed?: VerifyFunction.LocalPasswordFn,
  ): PassportLocal.Strategy;
}

export class LocalPasswordStrategyFactoryProvider implements Provider<LocalPasswordStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.LOCAL_PASSWORD_VERIFIER)
    private readonly verifierLocal: VerifyFunction.LocalPasswordFn,
    @inject(Strategies.Passport.LOCAL_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: PassportLocal.IStrategyOptions | PassportLocal.IStrategyOptionsWithRequest,
  ) {}

  value(): LocalPasswordStrategyFactory {
    return (options, verifier) => this.getLocalStrategyVerifier(options, verifier);
  }

  getLocalStrategyVerifier(
    options?: PassportLocal.IStrategyOptions | PassportLocal.IStrategyOptionsWithRequest,
    verifierPassed?: VerifyFunction.LocalPasswordFn,
  ): PassportLocal.Strategy {
    options = {...this.options, ...options};
    const verifyFn = verifierPassed ?? this.verifierLocal;
    if (options?.passReqToCallback) {
      return new PassportLocal.Strategy(
        options,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          req: Request,
          username: string,
          password: string,
          cb: (err: Error | null, user?: IAuthUser | false) => void,
        ) => {
          try {
            const user = await verifyFn(username, password, req);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            cb(null, user);
          } catch (err) {
            cb(err);
          }
        },
      );
    } else if (!!options && !isEmpty(options)) {
      return new PassportLocal.Strategy(
        options,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (username: string, password: string, cb: (err: Error | null, user?: IAuthUser | false) => void) => {
          try {
            const user = await verifyFn(username, password);
            if (!user) {
              throw new AuthenticationErrors.InvalidCredentials();
            }
            cb(null, user);
          } catch (err) {
            cb(err);
          }
        },
      );
    } else {
      return new PassportLocal.Strategy(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (username: string, password: string, cb: (err: Error | null, user?: IAuthUser | false) => void) => {
          try {
            const user = await verifyFn(username, password, undefined);
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
