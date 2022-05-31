import {BindingKey} from '@loopback/core';
import * as helmet from 'helmet';
import {HelmetAction} from './providers';

export namespace HelmetSecurityBindings {
  export const HELMET_SECURITY_ACTION = BindingKey.create<HelmetAction>('eco.security.helmet.actions');

  export const CONFIG = BindingKey.create<helmet.HelmetOptions | null>('eco.security.helmet.config');
}
