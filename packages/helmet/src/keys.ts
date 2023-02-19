import {BindingKey} from '@loopback/core';
import * as helmet from 'helmet';
import {HelmetAction} from './providers';

export namespace HelmetSecurityBindings {
  export const HELMET_SECURITY_ACTION = BindingKey.create<HelmetAction>('bleco.security.helmet.actions');

  export const CONFIG = BindingKey.create<helmet.HelmetOptions | null>('bleco.security.helmet.config');
}
