import {Constructor} from '@loopback/core';
import {expect} from '@loopback/testlab';

import {NodemailerMessage, NodemailerProvider} from '../../providers';

describe('Nodemailer Service', () => {
  let NodemailerProviderMock: Constructor<NodemailerProvider>;
  const nodemailerConfig = {
    service: 'test',
    url: 'test url',
  };
  beforeEach(setupMockNodemailer);
  describe('nodemailer configuration addition', () => {
    it('return error when config is not passed', () => {
      expect(() => new NodemailerProviderMock()).to.throw('Nodemailer Config missing !');
    });
    it('returns error message on having no sender', async () => {
      const nodeConfig = {
        sendToMultipleReceivers: false,
      };

      const nodemailerProvider = new NodemailerProviderMock(nodeConfig, nodemailerConfig).value();
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

    it('returns error message on passing receiver length as zero', async () => {
      const nodeConfig = {
        sendToMultipleReceivers: false,
        senderEmail: 'test@test.com',
      };

      const nodemailerProvider = new NodemailerProviderMock(nodeConfig, nodemailerConfig).value();
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

      const nodemailerProvider = new NodemailerProviderMock(nodeConfig, nodemailerConfig).value();
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

      const nodemailerProvider = new NodemailerProviderMock(nodeConfig, nodemailerConfig).value();
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

      const nodemailerProvider = new NodemailerProviderMock(nodeConfig, nodemailerConfig).value();
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

  function setupMockNodemailer() {
    NodemailerProviderMock = NodemailerProvider;
  }
});
