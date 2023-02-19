import {BindingKey} from '@loopback/core';
import {SES} from 'aws-sdk';

export namespace SESBindings {
  export const Config = BindingKey.create<SES.Types.ClientConfiguration | null>('bleco.notification.config.ses');
}
