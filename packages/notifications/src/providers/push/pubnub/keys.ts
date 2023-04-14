import {BindingKey} from '@loopback/core';

import {PubnubConfig} from './types';

export namespace PubnubBindings {
  export const Config = BindingKey.create<PubnubConfig | null>('bleco.notification.config.pubnub');
}
