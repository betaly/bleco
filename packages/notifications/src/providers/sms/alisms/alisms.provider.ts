import {inject, Provider} from '@loopback/core';
import Dysmsapi20170525, {SendSmsRequest} from '@alicloud/dysmsapi20170525';
import * as aliapi from '@alicloud/openapi-client';
import {AliSMSAuthConfig, AliSMSMessage, AliSMSNotification} from './types';
import {HttpErrors} from '@loopback/rest';

const endpoint = 'dysmsapi.aliyuncs.com';

export class AliSMSProvider implements Provider<AliSMSNotification> {
  alismsService: Dysmsapi20170525;

  constructor(
    @inject('bleco.notification.config.alisms', {optional: true})
    private readonly alismsConfig?: AliSMSAuthConfig,
  ) {
    if (this.alismsConfig) {
      this.alismsService = new Dysmsapi20170525(
        new aliapi.Config({
          endpoint,
          ...alismsConfig,
        }),
      );
    } else {
      throw new HttpErrors.PreconditionFailed('AliSMS Config missing !');
    }
  }

  validateMessage(message: AliSMSMessage) {
    const {receiver, options} = message;
    if (receiver.to.length === 0) {
      throw new HttpErrors.BadRequest('Message receiver not found in request');
    }
    if (!options?.signName) {
      throw new HttpErrors.BadRequest('Message signName not found in request');
    }
    if (!options?.templateCode) {
      throw new HttpErrors.BadRequest('Message templateCode not found in request');
    }
  }

  value() {
    return {
      publish: async (message: AliSMSMessage) => {
        this.validateMessage(message);

        const publishes = message.receiver.to.map(async receiver => {
          const templateParam: string = message.body;
          const alismsMsgObj = new SendSmsRequest({
            phoneNumbers: receiver.id,
            signName: message.options.signName,
            templateCode: message.options.templateCode,
            templateParam,
          });

          return this.alismsService.sendSms(alismsMsgObj);
        });

        await Promise.all(publishes);
      },
    };
  }
}
