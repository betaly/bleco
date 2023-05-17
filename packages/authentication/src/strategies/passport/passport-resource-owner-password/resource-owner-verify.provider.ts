import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {VerifyFunction} from '../../types';

/**
 * A provider for default implementation of
 * VerifyFunction.ResourceOwnerPasswordFn
 *
 * It will just throw an error saying Not Implemented
 */
export class ResourceOwnerVerifyProvider implements Provider<VerifyFunction.ResourceOwnerPasswordFn> {
  constructor() {}

  value(): VerifyFunction.ResourceOwnerPasswordFn {
    return async (clientId, clientSecret, username, password) => {
      throw new BErrors.NotImplemented(`VerifyFunction.ResourceOwnerPasswordFn is not implemented`);
    };
  }
}
