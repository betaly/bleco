import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {VerifyFunction} from '../../types';

export class OtpVerifyProvider implements Provider<VerifyFunction.OtpAuthFn> {
  constructor() {}

  value(): VerifyFunction.OtpAuthFn {
    return async (_key: string, _otp: string) => {
      throw new BErrors.NotImplemented(`VerifyFunction.OtpAuthFn is not implemented`);
    };
  }
}
