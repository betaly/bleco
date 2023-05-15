import {Constructor} from '@loopback/core';
import {expect} from '@loopback/testlab';

import {AliSMSAuthConfig, AliSMSMessage, AliSMSProvider} from '../../providers';

describe('AliSMS Service', () => {
  const configuration: AliSMSAuthConfig = {
    accessKeyId: 'test',
    accessKeySecret: 'test',
  };

  let AliSMSProviderMock: Constructor<AliSMSProvider>;
  beforeEach(setupMockAliSMS);
  describe('alisms configuration addition', () => {
    it('returns error message on passing receiver length as zero', async () => {
      const alismsProvider = new AliSMSProviderMock(configuration).value();
      const result = await alismsProvider.publish(buildMessage()).catch(err => err.message);
      expect(result).which.eql('Message receiver not found in request');
    });

    it('returns error message when no alisms config', async () => {
      try {
        new AliSMSProvider();
      } catch (err) {
        const result = err.message;
        expect(result).which.eql('AliSMS Config missing !');
      }
    });

    it('returns error message without options.signName', async () => {
      const alismsProvider = new AliSMSProviderMock(configuration).value();
      await expect(alismsProvider.publish(buildMessage({receiver: {to: [{id: '1234567890'}]}}))).to.rejectedWith(
        'Message signName not found in request',
      );
    });

    it('returns error message without options.templateCode', async () => {
      const alismsProvider = new AliSMSProviderMock(configuration).value();
      await expect(
        alismsProvider.publish(
          buildMessage({
            receiver: {to: [{id: '1234567890'}]},
            options: {
              signName: 'test',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any,
          }),
        ),
      ).to.rejectedWith('Message templateCode not found in request');
    });

    it('returns the message (SMS text)', async () => {
      const alismsProvider = new AliSMSProviderMock(configuration).value();
      const result = alismsProvider.publish(
        buildMessage({
          receiver: {to: [{id: '1234567890'}]},
          options: {
            signName: 'test',
            templateCode: 'test',
          },
        }),
      );
      await expect(result).to.be.fulfilled();
    });
  });

  function setupMockAliSMS() {
    AliSMSProviderMock = AliSMSProvider;
  }
});

function buildMessage(message: Partial<AliSMSMessage> = {}): AliSMSMessage {
  return {
    receiver: {
      to: [],
    },
    body: JSON.stringify({test: 'test'}),
    sentDate: new Date(),
    type: 0,
    subject: undefined,
    ...message,
  } as AliSMSMessage;
}
