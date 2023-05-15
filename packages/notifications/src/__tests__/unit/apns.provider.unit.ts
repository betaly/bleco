import {Constructor} from '@loopback/context';
import {expect} from '@loopback/testlab';

import {ApnsProvider} from '../../providers';
import {ApnsMessage} from '../../providers/push/apns/types';

describe('Apns Service', () => {
  let ApnsMockProvider: Constructor<ApnsProvider>;
  beforeEach(setupMockApns);
  describe('apns configuration addition', () => {
    it('returns error message when no apns config', async () => {
      try {
        const apnsProvider = new ApnsProvider();
      } catch (err) {
        const result = err.message;
        expect(result).which.eql('Apns Config missing !');
      }
    });
    it('returns error message on passing receiver length as zero', async () => {
      const apnsProvider = new ApnsMockProvider({
        token: {
          key: '.',
          keyId: 'key-id',
          teamId: 'developer-team-id',
        },
        debug: true,
        production: false,
        options: {
          topic: 'dummy topic',
        },
      }).value();

      const message: ApnsMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
        options: {},
      };

      await expect(apnsProvider.publish(message)).to.be.rejectedWith('Message receiver not found in request !');
    });
    it('returns error message on passing receiver length as zero in value function', async () => {
      const apnsProvider = new ApnsMockProvider({
        token: {
          key: '.',
          keyId: 'key-id',
          teamId: 'developer-team-id',
        },
        debug: true,
        production: false,
        options: {
          topic: 'dummy topic',
        },
      }).value();
      const message: ApnsMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
        options: {},
      };
      await expect(apnsProvider.publish(message)).to.be.rejectedWith('Message receiver not found in request !');
    });
    it('returns error message on having no message subject', async () => {
      const apnsProvider = new ApnsMockProvider({
        token: {
          key: '.',
          keyId: 'key-id',
          teamId: 'developer-team-id',
        },
        debug: true,
        production: false,
        options: {
          topic: 'dummy topic',
        },
      });
      const message: ApnsMessage = {
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

      expect(() => apnsProvider.initialValidations(message)).to.throw('Message title not found !');
    });

    it('returns error message on having no message subject using value function', async () => {
      const apnsProvider = new ApnsMockProvider({
        token: {
          key: '.',
          keyId: 'key-id',
          teamId: 'developer-team-id',
        },
        debug: true,
        production: false,
        options: {
          topic: 'dummy topic',
        },
      }).value();
      const message: ApnsMessage = {
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
      await expect(apnsProvider.publish(message)).to.be.rejectedWith('Message title not found !');
    });
    it('returns a note object which will sent as a payload', async () => {
      const apnsProvider = new ApnsMockProvider({
        token: {
          key: '.',
          keyId: 'key-id',
          teamId: 'developer-team-id',
        },
        debug: true,
        production: false,
        options: {
          topic: 'dummy topic',
        },
      });
      const message: ApnsMessage = {
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

      const result = apnsProvider.getMainNote(message);
      expect(result).to.have.Object();
    }, 5000);
  });
  it('returns promise of response', async () => {
    const apnsProvider = new ApnsMockProvider({
      token: {
        key: '.',
        keyId: 'key-id',
        teamId: 'developer-team-id',
      },
      debug: true,
      production: false,
      options: {
        topic: 'dummy topic',
      },
    });
    const message: ApnsMessage = {
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
    const result = apnsProvider.sendingPushToReceiverTokens(message);
    expect(result).to.have.Promise();
  }, 5000);
  function setupMockApns() {
    ApnsMockProvider = ApnsProvider;
  }
});
