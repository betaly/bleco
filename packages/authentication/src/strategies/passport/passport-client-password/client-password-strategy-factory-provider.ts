import {Provider, inject} from '@loopback/core';
import {Request} from '@loopback/rest';
import * as ClientPasswordStrategy from 'passport-oauth2-client-password';

import {AuthErrorKeys} from '../../../error-keys';
import {IAuthClient} from '../../../types';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';

export interface ClientPasswordStrategyFactory {
  (
    options?: ClientPasswordStrategy.StrategyOptionsWithRequestInterface,
    verifierPassed?: VerifyFunction.OauthClientPasswordFn,
  ): ClientPasswordStrategy.Strategy;
}

export class ClientPasswordStrategyFactoryProvider implements Provider<ClientPasswordStrategyFactory> {
  constructor(
    @inject(Strategies.Passport.OAUTH2_CLIENT_PASSWORD_VERIFIER)
    private readonly verifier: VerifyFunction.OauthClientPasswordFn,
  ) {}

  value(): ClientPasswordStrategyFactory {
    return (options, verifier) => this.getClientPasswordVerifier(options, verifier);
  }

  getClientPasswordVerifier(
    options?: ClientPasswordStrategy.StrategyOptionsWithRequestInterface,
    verifierPassed?: VerifyFunction.OauthClientPasswordFn,
  ): ClientPasswordStrategy.Strategy {
    const verifyFn = verifierPassed ?? this.verifier;
    if (options?.passReqToCallback) {
      return new ClientPasswordStrategy.Strategy(
        options,

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          req: Request,
          clientId: string,
          clientSecret: string,
          cb: (err: string | null, client?: IAuthClient | false) => void,
        ) => {
          try {
            const client = await verifyFn(clientId, clientSecret, req);
            if (!client) {
              return cb(AuthErrorKeys.ClientInvalid);
            } else if (!client.clientSecret || client.clientSecret !== clientSecret) {
              return cb(AuthErrorKeys.ClientVerificationFailed);
            }
            cb(null, client);
          } catch (err) {
            cb(err?.message ?? err);
          }
        },
      );
    } else {
      return new ClientPasswordStrategy.Strategy(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          clientId: string,
          clientSecret: string,
          cb: (err: string | null, client?: IAuthClient | false) => void,
        ) => {
          try {
            const client = await verifyFn(clientId, clientSecret);
            if (!client) {
              return cb(AuthErrorKeys.ClientInvalid);
            } else if (!client.clientSecret || client.clientSecret !== clientSecret) {
              return cb(AuthErrorKeys.ClientVerificationFailed);
            }
            cb(null, client);
          } catch (err) {
            cb(err?.message ?? err);
          }
        },
      );
    }
  }
}
