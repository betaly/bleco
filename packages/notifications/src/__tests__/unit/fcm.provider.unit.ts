import {expect} from '@loopback/testlab';
import * as admin from 'firebase-admin';

import {FcmMessage, FcmProvider} from '../../providers';

describe('FCM Service', () => {
  const app = admin.initializeApp();
  const fcmProvider = new FcmProvider(app);

  describe('fcm configuration addition', () => {
    it('returns error message when no firebase config', () => {
      expect(() => new FcmProvider()).to.throw('Firebase Config missing !');
    });

    it('returns error message on passing receiver length as zero', () => {
      const message: FcmMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
        options: {},
      };

      expect(() => fcmProvider.initialValidations(message)).to.throw(
        'Message receiver, topic or condition not found in request !',
      );
    });

    it('returns error message on passing receiver length as zero in value function', async () => {
      const message: FcmMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
        options: {},
      };
      await expect(fcmProvider.value().publish(message)).to.be.rejectedWith(
        'Message receiver, topic or condition not found in request !',
      );
    });

    it('returns error message on having no message subject', () => {
      const message: FcmMessage = {
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
        options: {},
      };

      expect(() => fcmProvider.initialValidations(message)).to.throw('Message title not found !');
    });

    it('returns error message on having no message subject using value function', async () => {
      const message: FcmMessage = {
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
        options: {},
      };
      await expect(fcmProvider.value().publish(message)).to.be.rejectedWith('Message title not found !');
    });

    it('returns array for sending push to conditions', () => {
      const message: FcmMessage = {
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
        options: {},
        subject: 'test',
      };

      const generalMessageObj = {
        notification: {
          title: 'test',
          body: 'test',
        },
      };
      const result = fcmProvider.sendingPushToConditions(message, generalMessageObj);
      expect(result).which.eql([]);
    }, 5000);

    it('returns array for sending push to receive tokens', () => {
      const message: FcmMessage = {
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
        options: {},
        subject: 'test',
      };

      const generalMessageObj = {
        notification: {
          title: 'test',
          body: 'test',
        },
      };
      const result = fcmProvider.sendingPushToReceiverTokens(message, generalMessageObj);
      expect(result).to.have.Array();
    }, 5000);

    it('returns array for sending push to topics', () => {
      const message: FcmMessage = {
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
        options: {},
        subject: 'test',
      };

      const generalMessageObj = {
        notification: {
          title: 'test',
          body: 'test',
        },
      };
      const result = fcmProvider.sendingPushToTopics(message, generalMessageObj);
      expect(result).which.eql([]);
    }, 5000);

    it('returns array for sending in value function', () => {
      const message: FcmMessage = {
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
        options: {},
        subject: 'test',
      };
      const result = fcmProvider.value().publish(message);
      expect(result).to.have.Promise();
    }, 5000);
  });
});
