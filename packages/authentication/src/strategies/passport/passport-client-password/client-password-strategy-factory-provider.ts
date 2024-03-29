import {Provider, inject} from '@loopback/core';
import {Request} from '@loopback/rest';

import {AuthenticationErrors} from '../../../errors';
import {IAuthClient} from '../../../types';
import {Strategies} from '../../keys';
import {VerifyFunction} from '../../types';
import * as ClientPasswordStrategy from './client-password-strategy';

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
    @inject(Strategies.Passport.CLIENT_PASSWORD_STRATEGY_OPTIONS, {optional: true})
    private readonly options?: ClientPasswordStrategy.StrategyOptionsWithRequestInterface,
  ) {}

  value(): ClientPasswordStrategyFactory {
    return (options, verifier) => this.getClientPasswordVerifier(options, verifier);
  }

  clientPasswordVerifierHelper(client: IAuthClient | null, clientSecret: string | undefined) {
    if (!client?.clientSecret || client.clientSecret !== clientSecret) {
      throw new AuthenticationErrors.ClientVerificationFailed();
    } else {
      // do nothing
    }
  }

  getClientPasswordVerifier(
    options?: ClientPasswordStrategy.StrategyOptionsWithRequestInterface,
    verifierPassed?: VerifyFunction.OauthClientPasswordFn,
  ): ClientPasswordStrategy.Strategy {
    options = {...this.options, ...options};
    const verifyFn = verifierPassed ?? this.verifier;
    if (options?.passReqToCallback) {
      return new ClientPasswordStrategy.Strategy(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          clientId: string,
          clientSecret: string | undefined,
          cb: (err: Error | null, client?: IAuthClient | null) => void,
          req: Request | undefined,
        ) => {
          try {
            const client = await verifyFn(clientId, clientSecret, req);
            this.clientPasswordVerifierHelper(client, clientSecret);
            cb(null, client);
          } catch (err) {
            cb(err);
          }
        },
        options,
      );
    } else {
      return new ClientPasswordStrategy.Strategy(
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (
          clientId: string,
          clientSecret: string | undefined,
          cb: (err: Error | null, client?: IAuthClient | null) => void,
        ) => {
          try {
            const client = await verifyFn(clientId, clientSecret);
            this.clientPasswordVerifierHelper(client, clientSecret);
            cb(null, client);
          } catch (err) {
            cb(err);
          }
        },
      );
    }
  }
}
