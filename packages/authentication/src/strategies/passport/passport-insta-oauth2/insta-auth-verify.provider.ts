import {Provider} from '@loopback/context';
import {Request} from '@loopback/rest';
import {BErrors} from 'berrors';
import * as InstagramStrategy from 'passport-instagram';

import {VerifyCallback, VerifyFunction} from '../../types';

/**
 * A provider for default implementation of VerifyFunction.LocalPasswordFn
 *
 * It will just throw an error saying Not Implemented
 */
export class InstagramAuthVerifyProvider implements Provider<VerifyFunction.InstagramAuthFn> {
  constructor() {}

  value(): VerifyFunction.InstagramAuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: InstagramStrategy.Profile,
      cb: VerifyCallback,
      req?: Request,
    ) => {
      throw new BErrors.NotImplemented(`VerifyFunction.InstagramAuthFn is not implemented`);
    };
  }
}
