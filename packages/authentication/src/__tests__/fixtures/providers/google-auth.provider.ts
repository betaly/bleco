import {Provider} from '@loopback/core';
import {Request} from '@loopback/rest';
import * as GoogleStrategy from 'passport-google-oauth20';

import {VerifyFunction} from '../../../strategies';
import {IAuthUser} from '../../../types';

export class BearerTokenVerifyProvider implements Provider<VerifyFunction.GoogleAuthFn> {
  constructor() {}

  value(): VerifyFunction.GoogleAuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleStrategy.Profile,
      cb: GoogleStrategy.VerifyCallback,
      req?: Request,
    ) => {
      const userToPass: IAuthUser = {
        id: 1,
        username: 'xyz',
        password: 'pass',
      };

      return userToPass;
    };
  }
}
