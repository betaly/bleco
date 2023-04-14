/* eslint-disable @typescript-eslint/no-explicit-any */
import {expect} from '@loopback/testlab';
import aws from 'aws-sdk';

import {SNSMessage, SnsProvider} from '../../providers';

jest.mock('aws-sdk');
const SNS = aws.SNS as unknown as jest.Mock<typeof aws.SNS>;

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
  const configration = {
    apiVersion: 'test',
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
  };

  beforeAll(() => {
    SNS.mockReturnValue({
      publish: () => ({promise: () => Promise.resolve()}),
    } as any);
  });
  afterAll(() => {
    SNS.mockReset();
  });
  describe('sns configration addition', () => {
    it('returns error message on passing reciever length as zero', async () => {
      const snsProvider = new SnsProvider(configration).value();
      const result = await snsProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message receiver not found in request');
    });

    it('returns error message when no sns config', async () => {
      try {
        new SnsProvider();
      } catch (err) {
        const result = err.message;
        expect(result).which.eql('AWS SNS Config missing !');
      }
    });

    it('returns the message', async () => {
      const snsProvider = new SnsProvider(configration).value();
      const result = snsProvider.publish(message1);
      await expect(result).to.be.fulfilled();
    });
  });
});
