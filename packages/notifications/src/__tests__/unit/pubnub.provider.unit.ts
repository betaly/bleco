/* eslint-disable @typescript-eslint/no-explicit-any */
import {expect} from '@loopback/testlab';
import PubNub from 'pubnub';

import {PubNubMessage, PubNubProvider, PubnubConfig} from '../../providers';
import {Config} from '../../types';

jest.mock('pubnub');
const PubNubMock = PubNub as unknown as jest.Mock<typeof PubNub>;

describe('Pubnub Service', () => {
  const pubnubConfig: PubnubConfig = {
    subscribeKey: 'test',
    uuid: 'test123',
  };

  beforeAll(() => {
    PubNubMock.mockImplementation(
      () =>
        ({
          publish: () => Promise.resolve(),
          grant: () => Promise.resolve(),
        } as any),
    );
  });

  afterAll(() => {
    PubNubMock.mockReset();
  });

  describe('pubnub configuration addition', () => {
    it('returns error message on passing receiver length as zero', async () => {
      const pubnubProvider = new PubNubProvider(pubnubConfig).value();
      const message: PubNubMessage = {
        receiver: {
          to: [],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
      };

      const result = await pubnubProvider.publish(message).catch(err => err.message);
      expect(result).which.eql('Message receiver not found in request');
    });

    it('returns a Promise to be fulfilled for publish', async () => {
      const pubnubProvider = new PubNubProvider(pubnubConfig).value();
      const message: PubNubMessage = {
        receiver: {
          to: [
            {
              type: 0,
              id: 'dummyId',
            },
          ],
        },
        body: 'test',
        sentDate: new Date(),
        type: 0,
      };
      const result = pubnubProvider.publish(message);
      await expect(result).to.be.fulfilled();
    });

    it('returns error message when no pubnub config', async () => {
      try {
        new PubNubProvider();
      } catch (err) {
        const result = err.message;
        expect(result).which.eql('Pubnub Config missing !');
      }
    });

    it('returns error for grant access when token or ttl is not sent', async () => {
      const pubnubProvider = new PubNubProvider(pubnubConfig).value();
      const config: Config = {
        receiver: {
          to: [
            {
              id: 'dummy',
              type: 0,
            },
          ],
        },
        type: 0,
      };
      const result = await pubnubProvider.grantAccess(config).catch(err => err.message);
      expect(result).which.eql('Authorization token or ttl not found in request');
    });

    it('returns error for revoke access when token is not sent', async () => {
      const pubnubProvider = new PubNubProvider(pubnubConfig).value();
      const config: Config = {
        receiver: {
          to: [
            {
              id: 'dummy',
              type: 0,
            },
          ],
        },
        type: 0,
      };
      const result = await pubnubProvider.revokeAccess(config).catch(err => err.message);
      expect(result).which.eql('Authorization token not found in request');
    });

    it('returns success for revoking the access', async () => {
      const pubnubProvider = new PubNubProvider(pubnubConfig).value();
      const config: Config = {
        receiver: {
          to: [
            {
              id: 'dummy',
              type: 0,
            },
          ],
        },
        type: 0,
        options: {
          ['token']: 'dummy',
        },
      };
      const result = await pubnubProvider.revokeAccess(config);
      expect(result).to.be.eql({success: true});
    });

    it('returns success for granting the access', async () => {
      const pubnubProvider = new PubNubProvider(pubnubConfig).value();
      const config: Config = {
        receiver: {
          to: [
            {
              id: 'dummy',
              type: 0,
            },
          ],
        },
        type: 0,
        options: {
          ['token']: 'dummy',
          ['ttl']: 'dummy',
        },
      };
      const result = await pubnubProvider.grantAccess(config);
      expect(result).to.be.eql({ttl: 'dummy'});
    });
  });
});
