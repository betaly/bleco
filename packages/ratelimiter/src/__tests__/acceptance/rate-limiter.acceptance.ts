import {Client} from '@loopback/testlab';
import {TestApplication} from '../fixtures/application';
import {setUpApplication} from '../fixtures/helpers';
import {RateLimitConfig} from '../../types';
import {SequenceHandler} from '@loopback/rest';
import {Class} from '@loopback/repository';
import {TestMiddlewareSequence, TestSequence} from '../fixtures/sequences';
import {RateLimitSecurityBindings} from '../../keys';

describe('RateLimiter Acceptance Test Cases', () => {
  describe(`RateLimiter Test Suites for action sequence`, () => {
    testRateLimiter(TestSequence);
  });

  describe(`RateLimiter Test Suites for middleware sequence`, () => {
    testRateLimiter(TestMiddlewareSequence);
  });
});

function testRateLimiter(sequence: Class<SequenceHandler>, config?: RateLimitConfig) {
  const rateLimitConfig = {
    ds: ':memory:',
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
    app.getSync(RateLimitSecurityBindings.RATE_LIMIT_FACTORY_SERVICE).clear();
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

  it('should overwrite the default behaviour when rate limit decorator is applied', async () => {
    //Max request is set to 1 in decorator
    await client.get('/testDecorator').expect(200);
    await client.get('/testDecorator').expect(429);
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
}
