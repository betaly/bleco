import {Provider} from '@loopback/context';
import {Request} from '@loopback/rest';
import {BErrors} from 'berrors';

import * as AuthaStrategy from '@authajs/passport-autha';

import {VerifyFunction} from '../../types';

/**
 * A provider for default implementation of VerifyFunction.AuthaFn
 *
 * It will just throw an error saying Not Implemented
 */
export class AuthaVerifyProvider implements Provider<VerifyFunction.AuthaFn> {
  constructor() {}

  value(): VerifyFunction.AuthaFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: AuthaStrategy.Profile,
      cb: AuthaStrategy.VerifyCallback,
      req?: Request,
    ) => {
      throw new BErrors.NotImplemented(`VerifyFunction.AuthaFn is not implemented`);
    };
  }
}
