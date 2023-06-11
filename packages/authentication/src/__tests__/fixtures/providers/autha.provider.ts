import {Provider} from '@loopback/core';
import {Request} from '@loopback/rest';
import * as AuthaStrategy from '@authajs/passport-autha';

import {VerifyFunction} from '../../../strategies';
import {IAuthUser} from '../../../types';

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
      const userToPass: IAuthUser = {
        id: 1,
        username: 'xyz',
        password: 'pass',
      };

      return userToPass;
    };
  }
}
