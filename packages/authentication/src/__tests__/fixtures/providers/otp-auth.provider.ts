import {Request} from 'express';
import {Provider} from '@loopback/core';
import {VerifyFunction} from '../../../strategies';
import {IAuthUser} from '../../../types';

export class OtpVerifyProvider implements Provider<VerifyFunction.OtpAuthFn> {
  constructor() {}

  value(): VerifyFunction.OtpAuthFn {
    return async (code: string, owner: string, token: string, req?: Request) => {
      if (!code || !owner || !token) {
        return null;
      }

      const userToPass: IAuthUser = {
        id: 1,
        email: owner || 'xyz',
      };

      return userToPass;
    };
  }
}
