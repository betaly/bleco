import {Constructor} from '@loopback/core';
import {expect} from '@loopback/testlab';

import {SNSMessage, SnsProvider} from '../../providers';

describe('Sns Service', () => {
  const message: SNSMessage = {
    receiver: {
      to: [],
    },
    body: 'test',
    sentDate: new Date(),
    type: 0,
    subject: undefined,
  };
  const message1: SNSMessage = {
    receiver: {
      to: [
        {
          id: 'dummy',
          type: 0,
        },
      ],
    },
    body: 'test',
    sentDate: new Date(),
    type: 0,
    subject: undefined,
  };
  const configuration = {
    apiVersion: 'test',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
  };

  let SnsProviderMock: Constructor<SnsProvider>;
  beforeEach(setupMockSNS);
  describe('sns configuration addition', () => {
    it('returns error message on passing receiver length as zero', async () => {
      const snsProvider = new SnsProviderMock(configuration).value();
      const result = await snsProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message receiver not found in request');
    });

    it('returns error message when no sns config', async () => {
      try {
        const snsProvider = new SnsProvider();
      } catch (err) {
        const result = err.message;
        expect(result).which.eql('AWS SNS Config missing !');
      }
    });

    it('returns the message', async () => {
      const snsProvider = new SnsProviderMock(configuration).value();
      const result = snsProvider.publish(message1);
      await expect(result).to.be.fulfilled();
    });
  });

  function setupMockSNS() {
    SnsProviderMock = SnsProvider;
  }
});
