import {Request, Response} from '@loopback/rest';

import {RatelimitActionProvider} from '../../providers';
import {RateLimitStoreClientType} from '../../types';
import {RateLimitFactoryService} from '../../services';
import {noop} from '../../utils';

describe('Rate Limit action Service', () => {
  const factory = new RateLimitFactoryService();
  const memoryStoreSource = {
    type: RateLimitStoreClientType.Memory,
    storeClient: null,
  };

  const rateLimitMetadataFalse = async () => ({
    enabled: false,
  });

  const rateLimitMetadataTrue = async () => ({
    enabled: true,
  });

  describe('Ratelimit action', () => {
    it('verifies whether value function returns a function', async () => {
      const provider = new RatelimitActionProvider(
        () => Promise.resolve(memoryStoreSource),
        rateLimitMetadataFalse,
        factory,
        noop,
      );

      const valueFn = provider.value();
      expect(typeof valueFn).toBe('function');
    });

    describe('with enabledByDefault as default', function () {
      it('perform if metadata is not enabled', async () => {
        const provider = new RatelimitActionProvider(
          () => Promise.resolve(memoryStoreSource),
          rateLimitMetadataFalse,
          factory,
          noop,
        );
        jest.spyOn(provider, 'doRateLimit').mockImplementation(() => Promise.resolve());

        await provider.action({} as Request, {} as Response);
      });

      it('perform if metadata is enabled', async () => {
        const provider = new RatelimitActionProvider(
          () => Promise.resolve(memoryStoreSource),
          rateLimitMetadataTrue,
          factory,
          noop,
        );
        jest.spyOn(provider, 'doRateLimit').mockImplementation(() => Promise.resolve());

        await provider.action({} as Request, {} as Response);
      });
    });

    describe('without enabledByDefault', function () {
      it('skip rate limit if metadata is not enabled', async () => {
        const provider = new RatelimitActionProvider(
          () => Promise.resolve(memoryStoreSource),
          rateLimitMetadataFalse,
          factory,
          noop,
          {
            enabledByDefault: false,
          },
        );
        jest.spyOn(provider, 'doRateLimit').mockImplementation(() => Promise.reject('Should not be called'));

        await provider.action({} as Request, {} as Response);
      });

      it('perform if metadata is enabled', async () => {
        const provider = new RatelimitActionProvider(
          () => Promise.resolve(memoryStoreSource),
          rateLimitMetadataTrue,
          factory,
          noop,
          {
            enabledByDefault: false,
          },
        );
        jest.spyOn(provider, 'doRateLimit').mockImplementation(() => Promise.resolve());

        await provider.action({} as Request, {} as Response);
      });
    });
  });
});
