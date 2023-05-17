import {Provider} from '@loopback/context';
import {BErrors} from 'berrors';

import {CasbinEnforcerConfigGetterFn, IAuthUserWithPermissions} from '../types';

export class CasbinEnforcerProvider implements Provider<CasbinEnforcerConfigGetterFn> {
  constructor() {}

  value(): CasbinEnforcerConfigGetterFn {
    return async (authUser: IAuthUserWithPermissions, resource: string, isCasbinPolicy?: boolean) => {
      throw new BErrors.NotImplemented(`CasbinEnforcerConfigGetterFn Provider is not implemented`);
    };
  }
}
