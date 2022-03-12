import {VerifyFunction} from '../../types';
import {Provider} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';

/**
 * A provider for default implementation of VerifyFunction.OtpAuthFn
 *
 * It will just throw an error saying Not Implemented
 */
export class OtpVerifyProvider implements Provider<VerifyFunction.OtpAuthFn> {
  constructor() {}

  value(): VerifyFunction.OtpAuthFn {
    return async (code, owner, token) => {
      throw new HttpErrors.NotImplemented(`VerifyFunction.OtpPasswordFn is not implemented`);
    };
  }
}
