import {BindingKey} from '@loopback/core';
import {SocketConfig} from './types';

export namespace SocketBindings {
  export const Config = BindingKey.create<SocketConfig | null>('eco.notification.config.socketio');
}
