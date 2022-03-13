import {Aliaser} from '@bleco/aliaser';
import {NotificationBindings} from '../keys';
import {EmailAliasMetadata} from './email';
import {PushAliasMetadata} from './push';
import {SmsAliasMetadata} from './sms';

export const NotificationProvidersAliaser = Aliaser.create(NotificationBindings.Config, {
  ...EmailAliasMetadata,
  ...PushAliasMetadata,
  ...SmsAliasMetadata,
});
