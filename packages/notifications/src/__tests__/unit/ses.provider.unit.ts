/* eslint-disable @typescript-eslint/no-explicit-any */
import {expect} from '@loopback/testlab';
import aws from 'aws-sdk';

import {SESMessage, SesProvider} from '../../providers';

jest.mock('aws-sdk');
const SES = aws.SES as unknown as jest.Mock<typeof aws.SES>;

describe('Ses Service', () => {
  beforeAll(() => {
    SES.mockReturnValue({
      sendEmail: () => ({promise: () => Promise.resolve()}),
    } as any);
  });
  afterAll(() => {
    SES.mockReset();
  });
  describe('ses configuration addition', () => {
    const sesConfig = {
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
    };

    it('returns error message on having no sender', async () => {
      const Config = {
        sendToMultipleReceivers: false,
      };
      const sesProvider = new SesProvider(Config, sesConfig).value();

      const message: SESMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
      };
      const result = await sesProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message sender not found in request');
    });

    it('returns error message on passing reciever length as zero', async () => {
      const Config = {
        sendToMultipleReceivers: false,
        senderEmail: 'test@test.com',
      };

      const sesProvider = new SesProvider(Config, sesConfig).value();
      const message: SESMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
      };
      const result = await sesProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message receiver not found in request');
    });

    it('returns error message when message is not complete', async () => {
      const Config = {
        sendToMultipleReceivers: false,
        senderEmail: 'test@test.com',
      };

      const sesProvider = new SesProvider(Config, sesConfig).value();
      const message: SESMessage = {
        receiver: {
          to: [
            {
              id: 'dummy',
            },
          ],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
      };
      const result = await sesProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message data incomplete');
    });

    it('returns error message when no ses config', async () => {
      try {
        new SesProvider();
      } catch (err) {
        const result = err.message;
        expect(result).which.eql('AWS SES Config missing !');
      }
    });

    it('returns a Promise after sending message to individual user', async () => {
      const Config = {
        sendToMultipleReceivers: false,
        senderEmail: 'test@gmail.com',
      };

      const sesProvider = new SesProvider(Config, sesConfig).value();
      const message: SESMessage = {
        receiver: {
          to: [
            {
              id: 'dummy',
            },
          ],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
        subject: 'test',
      };
      const result = sesProvider.publish(message);
      await expect(result).to.be.fulfilled();
    });

    it('returns a Promise after sending message to multiple user', async () => {
      const Config = {
        sendToMultipleReceivers: true,
        senderEmail: 'test@gmail.com',
      };
      const sesProvider = new SesProvider(Config, sesConfig).value();
      const message: SESMessage = {
        receiver: {
          to: [
            {
              id: 'dummy',
            },
          ],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
        subject: 'test',
      };
      const result = sesProvider.publish(message);
      await expect(result).to.be.fulfilled();
    });
  });
});
