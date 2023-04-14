import {Provider} from '@loopback/core';
import {Request} from '@loopback/rest';

import {VerifyFunction} from '../../../strategies';
import {IAuthUser} from '../../../types';

export class LocalVerifyProvider implements Provider<VerifyFunction.LocalPasswordFn> {
  constructor() {}

  value(): VerifyFunction.LocalPasswordFn {
    return async (username: string, password: string, req?: Request) => {
      if (!username || !password) {
        return null;
      }

      if (username === '') {
        return null;
      }

      const userToPass: IAuthUser = {
        id: 1,
        username,
        password,
      };

      return userToPass;
    };
  }
}
