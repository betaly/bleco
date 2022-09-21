import {expect} from '@loopback/testlab';
import * as nodemailer from 'nodemailer';
import {NodemailerMessage, NodemailerProvider} from '../../providers/email/nodemailer';

jest.mock('nodemailer');
const createTransport = nodemailer.createTransport as unknown as jest.Mock<typeof nodemailer.createTransport>;

describe('Nodemailer Service', () => {
  const nodemailerConfig = {
    service: 'test',
    url: 'test url',
  };

  beforeAll(() => {
    createTransport.mockReturnValue({
      sendMail: jest.fn().mockReturnValue({}),
    } as never);
  });

  afterAll(() => {
    createTransport.mockReset();
  });

  describe('nodemailer configuration addition', () => {
    it('return error when config is not passed', async () => {
      try {
        new NodemailerProvider();
      } catch (err) {
        const result = err.message;
        expect(result).which.eql('Nodemailer Config missing !');
      }
    });
    it('returns error message on having no sender', async () => {
      const nodeConfig = {
        sendToMultipleReceivers: false,
      };

      const nodemailerProvider = new NodemailerProvider(nodeConfig, nodemailerConfig).value();
      const message: NodemailerMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
      };
      const result = await nodemailerProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message sender not found in request');
    });

    it('returns error message on passing reciever length as zero', async () => {
      const nodeConfig = {
        sendToMultipleReceivers: false,
        senderEmail: 'test@test.com',
      };

      const nodemailerProvider = new NodemailerProvider(nodeConfig, nodemailerConfig).value();
      const message: NodemailerMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
      };
      const result = await nodemailerProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message receiver not found in request');
    });

    it('returns error message when message is not complete', async () => {
      const nodeConfig = {
        sendToMultipleReceivers: false,
        senderEmail: 'test@test.com',
      };

      const nodemailerProvider = new NodemailerProvider(nodeConfig, nodemailerConfig).value();
      const message: NodemailerMessage = {
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
      const result = await nodemailerProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message data incomplete');
    });

    it('returns Promise to be fulfilled for individual users', async () => {
      const nodeConfig = {
        sendToMultipleReceivers: false,
        senderEmail: 'test@test.com',
      };

      const nodemailerProvider = new NodemailerProvider(nodeConfig, nodemailerConfig).value();
      const message: NodemailerMessage = {
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
      const result = nodemailerProvider.publish(message);
      await expect(result).to.be.fulfilled();
    });

    it('returns Promise to be fulfilled for multiple users', async () => {
      const nodeConfig = {
        sendToMultipleReceivers: true,
        senderEmail: 'test@test.com',
      };

      const nodemailerProvider = new NodemailerProvider(nodeConfig, nodemailerConfig).value();
      const message: NodemailerMessage = {
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
      const result = nodemailerProvider.publish(message);
      await expect(result).to.be.fulfilled();
    });
  });
});
