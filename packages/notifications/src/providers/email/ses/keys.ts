import {BindingKey} from '@loopback/core';
import {SES} from 'aws-sdk';

export namespace SESBindings {
  export const Config = BindingKey.create<SES.Types.ClientConfiguration | null>(
    'sf.notification.config.ses',
  );
}
