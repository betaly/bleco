import {Class} from '@loopback/repository';
import {SequenceHandler} from '@loopback/rest';
import {Client} from '@loopback/testlab';

import {RateLimitSecurityBindings} from '../../keys';
import {RateLimitConfig} from '../../types';
import {TestApplication} from '../fixtures/application';
import {setUpApplication} from '../fixtures/helpers';
import {TestMiddlewareSequence, TestSequence} from '../fixtures/sequences';

describe('RateLimiter Acceptance Test Cases', () => {
  describe(`RateLimiter Test Suites for action sequence`, () => {
    testRateLimiter(TestSequence);
  });

  describe(`RateLimiter Test Suites for middleware sequence`, () => {
    testRateLimiter(TestMiddlewareSequence);
  });
});

function testRateLimiter(sequence: Class<SequenceHandler>, config?: RateLimitConfig) {
  const rateLimitConfig: RateLimitConfig = {
    ds: ':memory:',
    headers: true,
    points: 5,
    duration: 2,
    ...config,
  };

  let app: TestApplication;
  let client: Client;

  beforeAll(async () => {
    ({app, client} = await setUpApplication(sequence, rateLimitConfig));
  });

  afterAll(async () => {
    await app.stop();
  });

  afterEach(async () => {
    app.getSync(RateLimitSecurityBindings.RATELIMIT_FACTORY_SERVICE).clear();
  });

  afterAll(async () => app.stop());

  it('should hit end point when number of requests is less than max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < 4; i++) {
      await client.get('/test').expect(200);
    }
  });

  it('should hit end point when number of requests is equal to max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < 5; i++) {
      await client.get('/test').expect(200);
    }
  });

  it('should give error when number of requests is greater than max requests allowed', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < 5; i++) {
      await client.get('/test').expect(200);
    }
    await client.get('/test').expect(429);
  });

  it('should throw no error if requests more than max are sent after window resets', async () => {
    //Max request is set to 5 while binding
    for (let i = 0; i < 5; i++) {
      await client.get('/test').expect(200);
    }
    setTimeout(() => {
      client
        .get('/test')
        .expect(200)
        .then(
          () => {},
          () => {},
        );
    }, 2000);
  });

  it('should using options from provider', async () => {
    await client.get('/testWithProvider').expect('ratelimit-remaining', '4').expect('ratelimit-limit', '5').expect(200);
  });

  describe('decorator group none', () => {
    it('should overwrite the default behaviour when rate limit decorator is applied', async () => {
      //Max request is set to 1 in decorator
      await client.get('/testLimit').expect(200);
      await client.get('/testLimit').expect(429);
    });
  });

  describe('decorator group union', () => {
    it("should return the first limiter's result when all points have been consumed", async () => {
      await client.get('/testUnion').expect('ratelimit-remaining', '1').expect('ratelimit-limit', '2').expect(200);
      await client.get('/testUnion').expect('ratelimit-remaining', '1').expect('ratelimit-limit', '3').expect(200);
      await client.get('/testUnion').expect('ratelimit-remaining', '0').expect('ratelimit-limit', '2').expect(429);
    });
  });

  describe('decorator group burst', () => {
    it('should hit end point when number of requests is less than max requests allowed', async () => {
      await client.get('/testBurst').expect('ratelimit-remaining', '0').expect('ratelimit-limit', '1').expect(200);
      await client.get('/testBurst').expect('ratelimit-remaining', '0').expect('ratelimit-limit', '1').expect(200);
      await client.get('/testBurst').expect('ratelimit-remaining', '0').expect('ratelimit-limit', '1').expect(200);
    });
  });
}
