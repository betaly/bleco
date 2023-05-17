import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {VerifyFunction} from '../../types';

/**
 * A provider for default implementation of VerifyFunction.OauthClientPasswordFn
 *
 * It will just throw an error saying Not Implemented
 */
export class ClientPasswordVerifyProvider implements Provider<VerifyFunction.OauthClientPasswordFn> {
  constructor() {}

  value(): VerifyFunction.OauthClientPasswordFn {
    return async (clientId: string, clientSecret: string) => {
      throw new BErrors.NotImplemented(`VerifyFunction.OauthClientPasswordFn is not implemented`);
    };
  }
}
