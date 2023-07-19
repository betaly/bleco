import {Request, Response, RestApplication} from '@loopback/rest';

import {RatelimitActionProvider} from '../../providers';
import {Store} from '../../types';

describe('Rate Limit action Service', () => {
  const dataStore = async () =>
    ({
      increment: jest.fn(),
      decrement: jest.fn(),
      resetKey: jest.fn(),
      resetAll: jest.fn(),
    } as Store);

  const restApplication = new RestApplication();

  const rateLimitMetadataFalse = async () => ({
    enabled: false,
  });

  const rateLimitMetadataTrue = async () => ({
    enabled: true,
  });

  describe('Ratelimit action', () => {
    it('verifies whether value function returns a function', async () => {
      const provider = new RatelimitActionProvider(dataStore, rateLimitMetadataFalse, restApplication);

      const valueFn = provider.value();
      expect(typeof valueFn).toBe('function');
    });

    describe('with enabledByDefault as default', function () {
      it('perform if metadata is not enabled', async () => {
        const provider = new RatelimitActionProvider(dataStore, rateLimitMetadataFalse, restApplication);
        jest.spyOn(provider, 'doRateLimit').mockImplementation(() => Promise.resolve());

        await provider.action({} as Request, {} as Response);
      });

      it('perform if metadata is enabled', async () => {
        const provider = new RatelimitActionProvider(dataStore, rateLimitMetadataTrue, restApplication);
        jest.spyOn(provider, 'doRateLimit').mockImplementation(() => Promise.resolve());

        await provider.action({} as Request, {} as Response);
      });
    });

    describe('without enabledByDefault', function () {
      it('skip rate limit if metadata is not enabled', async () => {
        const provider = new RatelimitActionProvider(dataStore, rateLimitMetadataFalse, restApplication, {
          name: 'test',
          enabledByDefault: false,
        });
        jest.spyOn(provider, 'doRateLimit').mockImplementation(() => Promise.reject('Should not be called'));

        await provider.action({} as Request, {} as Response);
      });

      it('perform if metadata is enabled', async () => {
        const provider = new RatelimitActionProvider(dataStore, rateLimitMetadataTrue, restApplication, {
          name: 'test',
          enabledByDefault: false,
        });
        jest.spyOn(provider, 'doRateLimit').mockImplementation(() => Promise.resolve());

        await provider.action({} as Request, {} as Response);
      });
    });
  });
});
