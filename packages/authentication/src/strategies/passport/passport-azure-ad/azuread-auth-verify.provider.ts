import {Provider} from '@loopback/context';
import {Request} from '@loopback/rest';
import {BErrors} from 'berrors';
import * as AzureADStrategy from 'passport-azure-ad';

import {VerifyFunction} from '../../types';

/**
 * A provider for default implementation of VerifyFunction.LocalPasswordFn
 *
 * It will just throw an error saying Not Implemented
 */
export class AzureADAuthVerifyProvider implements Provider<VerifyFunction.AzureADAuthFn> {
  constructor() {}

  value(): VerifyFunction.AzureADAuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: AzureADStrategy.IProfile,
      done: AzureADStrategy.VerifyCallback,
      req?: Request,
    ) => {
      throw new BErrors.NotImplemented(`VerifyFunction.AzureADAuthFn is not implemented`);
    };
  }
}
