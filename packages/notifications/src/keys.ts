import {BindingKey} from '@loopback/core';
import {INotification, INotificationConfig} from './types';

export namespace NotificationBindings {
  export const NotificationProvider = BindingKey.create<INotification>('eco.notification');
  export const SMSProvider = BindingKey.create<INotification>('eco.notification.sms');
  export const PushProvider = BindingKey.create<INotification>('eco.notification.push');
  export const EmailProvider = BindingKey.create<INotification>('eco.notification.email');

  export const Config = BindingKey.create<INotificationConfig | null>('eco.notification.config');
}
