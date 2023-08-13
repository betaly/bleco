import {getRateLimitMetadata, RateLimitMetadataProvider} from '../../providers';
import sinon from 'sinon';

describe('Rate Limit metadata Service', () => {
  describe('Ratelimit metadata class', () => {
    const methodName = 'test_method_name';

    it('returns undefined if there is no controller class or method name', () => {
      const controllerClass = class Test {};
      const rateLimitMetadata = new RateLimitMetadataProvider(controllerClass, '');
      const result = rateLimitMetadata.value();
      expect(result).toBeUndefined();
    });

    it('return the enabled property from the function', () => {
      const controllerClass = class Test {};
      const variable = {
        getRateLimitMetadata,
      };
      const fake = sinon.replace(
        variable,
        'getRateLimitMetadata',
        sinon.fake.returns({
          enabled: true,
        }),
      );
      const result = fake(controllerClass, methodName);
      expect(result).toHaveProperty('enabled', true);
    });
  });
});
