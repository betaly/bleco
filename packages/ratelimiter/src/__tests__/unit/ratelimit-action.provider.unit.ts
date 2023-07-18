jest.mock('express-rate-limit', () => {
  return {
    emit: jest.fn().mockReturnValue({}),
  };
});

const {RatelimitActionProvider} = require('../../providers/ratelimit-action.provider');
const {RestApplication} = require('@loopback/rest');

describe('Rate Limit action Service', () => {
  const dataStore = {
    increment: jest.fn(),
    decrement: jest.fn(),
    resetKey: jest.fn(),
    resetAll: jest.fn(),
  };

  const restApp = new RestApplication();

  const rateLimitMetadataFalse = jest.fn().mockResolvedValue({
    enabled: false,
  });

  const rateLimitMetadataTrue = jest.fn().mockResolvedValue({
    enabled: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Ratelimit action', () => {
    it('verifies whether value function returns a function', async () => {
      const provider = new RatelimitActionProvider(dataStore, rateLimitMetadataFalse, restApp);
      expect(typeof provider.value()).toBe('function');
    });

    it('returns promise if metadata is not enabled', async () => {
      const provider = new RatelimitActionProvider(jest.fn(), rateLimitMetadataFalse, restApp);
      await expect(provider.action({})).resolves.toBeUndefined();
    });

    it('returns promise if metadata is enabled', async () => {
      const provider = new RatelimitActionProvider(dataStore, rateLimitMetadataTrue, restApp);
      await expect(provider.action({})).rejects.toBeDefined();
    }, 5000);
  });
});
