import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {Keycloak, VerifyFunction} from '../../types';

/**
 * A provider for default implementation of VerifyFunction.LocalPasswordFn
 *
 * It will just throw an error saying Not Implemented
 */
export class KeycloakVerifyProvider implements Provider<VerifyFunction.KeycloakAuthFn> {
  constructor() {}

  value(): VerifyFunction.KeycloakAuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: Keycloak.Profile,
      cb: Keycloak.VerifyCallback,
    ) => {
      throw new BErrors.NotImplemented(`VerifyFunction.KeycloakAuthFn is not implemented`);
    };
  }
}
