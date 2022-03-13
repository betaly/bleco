import {Request} from 'express';
import {Provider} from '@loopback/core';
import {VerifyFunction} from '../../../strategies';
import {IAuthUser} from '../../../types';

export class OtpVerifyProvider implements Provider<VerifyFunction.OtpAuthFn> {
  constructor() {}

  value(): VerifyFunction.OtpAuthFn {
    return async (code: string, contact: string, token: string, req?: Request) => {
      if (!code || !contact || !token) {
        return null;
      }

      const userToPass: IAuthUser = {
        id: 1,
        email: contact || 'xyz',
      };

      return userToPass;
    };
  }
}
