# @bleco/ratelimiter

A simple loopback-next extension for rate limiting in loopback applications. 

## Features

`@bleco/ratelimiter` using [rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible) under the hood. 
It supports following datasources for rate limiting.

- Memory
- Redis
- MongoDB
- MySQL
- Postgres

And it also supports following aggregating algorithms for rate limiting.

- [Union](https://github.com/animir/node-rate-limiter-flexible/wiki/RateLimiterUnion) Combine 2 or more limiters to act as single
- [Burst](https://github.com/animir/node-rate-limiter-flexible/wiki/BurstyRateLimiter) Allow traffic bursts with BurstyRateLimiter implementation easier than with TokenBucket.

## Install

```sh
npm install @bleco/ratelimiter
```

## Usage

In order to use this component into your LoopBack application, please follow below steps.

- Add component to application.

```ts
this.component(RateLimiterComponent);
```

- Minimum configuration required for this component is given below.

Configure the datasource to be used for rate limiting. You can use any of the three datasources mentioned above.


```ts
this.bind(RateLimitSecurityBindings.CONFIG).to({
  ds: RedisDataSouece, // or data source binding key
});
```

- By default, ratelimiter will be initialized with default options as mentioned
  [here](https://github.com/animir/node-rate-limiter-flexible#basic-options). However, you can override any of the
  options using the Config Binding. Below is an example of how to do it with the redis datasource, you can also do it
  with other two datasources similarly.

```ts
const rateLimitKeyGen = (req: Request) => {
  const token =
    (req.headers &&
      req.headers.authorization &&
      req.headers.authorization.replace(/bearer /i, '')) ||
    '';
  return token;
};

// ......


this.bind(RateLimitSecurityBindings.CONFIG).to({
  ds: RedisDataSource,
  points: 60,
  key: rateLimitKeyGen,
});
```

- The component exposes a sequence action which can be added to your server sequence class. Adding this will trigger
  ratelimiter middleware for all the requests passing through.

```ts
export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(RateLimitSecurityBindings.ACTION)
    protected rateLimitAction: RateLimitAction,
  ) {}

  async handle(context: RequestContext) {
    const requestTime = Date.now();
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);

      // rate limit Action here
      await this.rateLimitAction(request, response);

      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      // ...
    } finally {
      // ...
    }
  }
}
```

- This component also exposes a method decorator for cases where you want tp specify different rate limiting options at
  API method level. For example, you want to keep hard rate limit for unauthorized API requests and want to keep it
  softer for other API requests. In this case, the global config will be overwritten by the method decoration. Refer
  below.

```ts
const rateLimitKeyGen = (req: Request) => {
  const token =
    (req.headers &&
      req.headers.authorization &&
      req.headers.authorization.replace(/bearer /i, '')) ||
    '';
  return token;
};

// .....

class SomeController {
  // ...
  @ratelimit(true, {
    points: 60,
    key: rateLimitKeyGen,
  })
  @patch(`/auth/change-password`, {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'If User password successfully changed.',
      },
      ...ErrorCodes,
    },
    security: [
      {
        [STRATEGY.BEARER]: [],
      },
    ],
  })
  async resetPassword(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(ResetPassword, {partial: true}),
        },
      },
    })
    req: ResetPassword,
    @param.header.string('Authorization') auth: string,
  ): Promise<User> {
    return this.authService.changepassword(req, auth);
  }
}
```

- You can also disable rate limiting for specific API methods using the decorator like below.

```ts
class SomeController {
  // ...
  @ratelimit(false)
  @authenticate(STRATEGY.BEARER)
  @authorize(['*'])
  @get('/auth/me', {
    description: ' To get the user details',
    security: [
      {
        [STRATEGY.BEARER]: [],
      },
    ],
    responses: {
      [STATUS_CODE.OK]: {
        description: 'User Object',
        content: {
          [CONTENT_TYPE.JSON]: AuthUser,
        },
      },
      ...ErrorCodes,
    },
  })
  async userDetails(
    @inject(RestBindings.Http.REQUEST) req: Request,
  ): Promise<AuthUser> {
    return this.authService.getme(req.headers.authorization);
  }
}
```

- More examples can be found [here](src/__tests__/fixtures/controllers/test.controller.ts) and [here](src/__tests__/acceptance).


## Credits

- [SourceFuse](https://github.com/sourcefuse)


## License

[MIT](LICENSE)
