import {Provider, inject} from '@loopback/core';
import {BErrors} from 'berrors';
import twilio, {Twilio} from 'twilio';

import {
  TwilioAuthConfig,
  TwilioCreateMessageParams,
  TwilioMessage,
  TwilioNotification,
  TwilioSubscriberType,
} from '../twilio/types';
import {TwilioBindings} from './keys';

export class TwilioProvider implements Provider<TwilioNotification> {
  twilioService: Twilio;
  constructor(
    @inject(TwilioBindings.Config, {
      optional: true,
    })
    private readonly twilioConfig?: TwilioAuthConfig,
  ) {
    if (this.twilioConfig) {
      this.twilioService = twilio(this.twilioConfig.accountSid, this.twilioConfig.authToken);
    } else {
      throw new BErrors.PreconditionFailed('Twilio Config missing !');
    }
  }

  value() {
    return {
      publish: async (message: TwilioMessage) => {
        if (message.receiver.to.length === 0) {
          throw new BErrors.BadRequest('Message receiver not found in request');
        }
        const publishes = message.receiver.to.map(async receiver => {
          const msg: string = message.body;
          const twilioMsgObj: TwilioCreateMessageParams = {
            body: msg,
            from:
              receiver.type && receiver.type === TwilioSubscriberType.TextSMSUser
                ? String(this.twilioConfig?.smsFrom)
                : String(this.twilioConfig?.waFrom),
            to:
              receiver.type && receiver.type === TwilioSubscriberType.TextSMSUser
                ? `+${receiver.id}`
                : `whatsapp:+${receiver.id}`,
          };

          // eslint-disable-next-line no-unused-expressions
          message.mediaUrl && (twilioMsgObj.mediaUrl = message.mediaUrl);

          // eslint-disable-next-line no-unused-expressions
          receiver.type &&
            receiver.type === TwilioSubscriberType.TextSMSUser &&
            this.twilioConfig?.smsStatusCallback &&
            (twilioMsgObj.statusCallback = this.twilioConfig?.smsStatusCallback);

          // eslint-disable-next-line no-unused-expressions
          !receiver.type &&
            this.twilioConfig?.waStatusCallback &&
            (twilioMsgObj.statusCallback = this.twilioConfig?.waStatusCallback);

          return this.twilioService.messages.create(twilioMsgObj);
        });
        await Promise.all(publishes);
      },
    };
  }
}
