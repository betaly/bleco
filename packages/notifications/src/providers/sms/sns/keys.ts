import {BindingKey} from '@loopback/core';
import {SNS} from 'aws-sdk';

export namespace SNSBindings {
  export const Config = BindingKey.create<SNS.ClientConfiguration | null>('bleco.notification.config.sns');
}
