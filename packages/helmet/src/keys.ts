import {BindingKey} from '@loopback/core';
import {HelmetAction} from './providers';
import * as helmet from 'helmet';

export namespace HelmetSecurityBindings {
  export const HELMET_SECURITY_ACTION = BindingKey.create<HelmetAction>('sf.security.helmet.actions');

  export const CONFIG = BindingKey.create<helmet.HelmetOptions | null>('sf.security.helmet.config');
}
