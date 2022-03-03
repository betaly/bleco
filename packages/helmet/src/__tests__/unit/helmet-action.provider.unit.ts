import {HelmetActionProvider} from '../../providers';
import * as helmet from 'helmet';
import {expect, stubExpressContext} from '@loopback/testlab';

describe('Helmet Service', () => {
  describe('Helmet Provider', () => {
    it('returns a promise after success', async () => {
      const config: helmet.HelmetOptions = {
        referrerPolicy: {
          policy: 'same-origin',
        },
        contentSecurityPolicy: {
          directives: {
            frameSrc: ["'self'"],
          },
        },
      };
      const context = stubExpressContext({
        url: '/',
        method: 'GET',
        payload: {key: 'value'},
      });
      const handler = new HelmetActionProvider(config).value();
      const result = handler(context.request, context.response);
      await expect(result).to.be.fulfilled();
    });
  });
});
