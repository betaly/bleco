import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {VerifyFunction} from '../../types';

/**
 * A provider for default implementation of VerifyFunction.LocalPasswordFn
 *
 * It will just throw an error saying Not Implemented
 */
export class LocalPasswordVerifyProvider implements Provider<VerifyFunction.LocalPasswordFn> {
  constructor() {}

  value(): VerifyFunction.LocalPasswordFn {
    return async (username: string, password: string) => {
      throw new BErrors.NotImplemented(`VerifyFunction.LocalPasswordFn is not implemented`);
    };
  }
}
