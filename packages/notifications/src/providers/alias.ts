import {Aliaser} from '@bleco/aliaser';

import {NotificationBindings} from '../keys';
import {EmailAliasMetadata} from './email/alias';
import {PushAliasMetadata} from './push/alias';
import {SmsAliasMetadata} from './sms/alias';

export const NotificationProvidersAliaser = Aliaser.create(NotificationBindings.Config, {
  ...EmailAliasMetadata,
  ...PushAliasMetadata,
  ...SmsAliasMetadata,
});
