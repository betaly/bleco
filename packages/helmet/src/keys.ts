import {BindingKey} from '@loopback/core';
import {HelmetAction} from './providers';
import * as helmet from 'helmet';

export namespace HelmetSecurityBindings {
  export const HELMET_SECURITY_ACTION = BindingKey.create<HelmetAction>('eco.security.helmet.actions');

  export const CONFIG = BindingKey.create<helmet.HelmetOptions | null>('eco.security.helmet.config');
}
