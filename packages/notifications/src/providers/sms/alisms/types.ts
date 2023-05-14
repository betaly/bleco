import {SMSMessage, SMSNotification, SMSReceiver, SMSSubscriber} from '../types';

import * as ali from '@alicloud/openapi-client';
import {OmitProperties} from 'ts-essentials';

export interface AliSMSAuthConfig extends OmitProperties<ali.Config, Function> {
  accessKeyId: string;
  accessKeySecret: string;
}

export interface AliSMSNotification extends SMSNotification {
  publish(message: AliSMSMessage): Promise<void>;
}

export interface AliSMSMessage extends SMSMessage {
  receiver: AliSMSReceiver;
  options: {
    signName: string;
    templateCode: string;
    // sonarignore:start
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    // sonarignore:end
  };
}

export interface AliSMSReceiver extends SMSReceiver {
  to: AliSMSSubscriber[];
}

export interface AliSMSSubscriber extends SMSSubscriber {}
