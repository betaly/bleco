import {Provider} from '@loopback/context';
import * as Auth0Strategy from 'passport-auth0';
import {BErrors} from 'berrors';
import {VerifyCallback, VerifyFunction} from '../../types';
import {Request} from '@loopback/rest';

export class Auth0VerityProvider implements Provider<VerifyFunction.Auth0AuthFn> {
  constructor() {}

  value(): VerifyFunction.Auth0AuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: Auth0Strategy.Profile,
      cb: VerifyCallback,
      req?: Request,
    ) => {
      throw new BErrors.NotImplemented(`VerifyFunction.Auth0AuthFn is not implemented`);
    };
  }
}
