import {get} from '@loopback/rest';

import {ratelimit} from '../../..';
import {TestBindings} from '../keys';

function getSpec(method: string) {
  return {
    responses: {
      '200': {
        description: `${method} End Point Called`,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              title: 'TestResponse',
              properties: {
                message: {type: 'string'},
                date: {type: 'string'},
              },
            },
          },
        },
      },
    },
  };
}

export class TestController {
  constructor() {}
  @get('/test', getSpec('Test'))
  test() {
    return {
      message: 'You have successfully called test end point',
      date: new Date(),
    };
  }

  @ratelimit(true, {
    points: 1,
  })
  @get('/testLimit', getSpec('Test Limit'))
  testLimit() {
    return {
      message: 'You have successfully called test limit end point',
      date: new Date(),
    };
  }

  @ratelimit(true, {
    provider: TestBindings.TEST_RATE_LIMITER,
    points: 1,
    duration: 1,
  })
  @get('/testWithProvider', getSpec('Test with Provider'))
  testWithProvider() {
    return {
      message: 'You have successfully called test with provider',
      date: new Date(),
    };
  }

  @ratelimit(true, {
    group: 'union',
    limiters: [
      {
        keyPrefix: 'limit1',
        points: 2,
        duration: 1,
      },
      {
        keyPrefix: 'limit2',
        points: 3,
        duration: 5,
      },
    ],
  })
  @get('/testUnion', getSpec('Test Union'))
  testUnion() {
    return {
      message: 'You have successfully called test union end point',
      date: new Date(),
    };
  }
  @ratelimit(true, {
    group: 'burst',
    limiters: [
      {
        points: 1,
        duration: 1,
      },
      {
        keyPrefix: 'burst',
        points: 5,
        duration: 5,
      },
    ],
  })
  @get('/testBurst', getSpec('Test Burst'))
  testBurst() {
    return {
      message: 'You have successfully called test burst end point',
      date: new Date(),
    };
  }
}
