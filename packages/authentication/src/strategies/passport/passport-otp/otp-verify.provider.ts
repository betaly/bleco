import {Provider} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {VerifyFunction} from '../../types';

/**
 * A provider for default implementation of VerifyFunction.OtpAuthFn
 *
 * It will just throw an error saying Not Implemented
 */
export class OtpVerifyProvider implements Provider<VerifyFunction.OtpAuthFn> {
  constructor() {}

  value(): VerifyFunction.OtpAuthFn {
    return async (code, contact, token) => {
      throw new HttpErrors.NotImplemented(`VerifyFunction.OtpPasswordFn is not implemented`);
    };
  }
}
