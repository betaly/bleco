import {BindingKey} from '@loopback/core';

import {INotification, INotificationConfig} from './types';

export namespace NotificationBindings {
  export const NotificationProvider = BindingKey.create<INotification>('bleco.notification');
  export const SMSProvider = BindingKey.create<INotification>('bleco.notification.sms');
  export const PushProvider = BindingKey.create<INotification>('bleco.notification.push');
  export const EmailProvider = BindingKey.create<INotification>('bleco.notification.email');

  export const Config = BindingKey.create<INotificationConfig | null>('bleco.notification.config');
}
