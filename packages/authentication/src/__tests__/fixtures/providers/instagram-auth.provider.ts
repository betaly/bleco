import {Provider} from '@loopback/core';
import {Request} from '@loopback/rest';
import * as InstagramStrategy from 'passport-instagram';

import {VerifyCallback, VerifyFunction} from '../../../strategies';
import {IAuthUser} from '../../../types';

export class BearerTokenVerifyProvider implements Provider<VerifyFunction.InstagramAuthFn> {
  constructor() {}

  value() {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: InstagramStrategy.Profile,
      cb: VerifyCallback,
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
