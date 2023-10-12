import {Provider} from '@loopback/context';
import {Request} from '@loopback/rest';
import {BErrors} from 'berrors';
import * as AppleStrategy from 'passport-apple';

import {VerifyFunction} from '../../types';

export class AppleAuthVerifyProvider implements Provider<VerifyFunction.AppleAuthFn> {
  constructor() {}

  value(): VerifyFunction.AppleAuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      idToken: string,
      profile: AppleStrategy.Profile,
      cb: AppleStrategy.VerifyCallback,
      req?: Request,
    ) => {
      throw new BErrors.NotImplemented(`VerifyFunction.AppleAuthFn is not implemented`);
    };
  }
}
