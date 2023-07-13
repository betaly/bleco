import * as AuthaStrategy from '@authajs/passport-autha';
import {Application, Provider} from '@loopback/core';
import {ExpressMiddlewareFactory} from '@loopback/express/src/types';
import {get} from '@loopback/openapi-v3';
import {Request, RestServer, RestTags, registerExpressMiddleware} from '@loopback/rest';
import {Client, createClientForHandler} from '@loopback/testlab';
import Sessions, {SessionOptions} from 'client-sessions';

import {authenticate} from '../../../../decorators';
import {VerifyFunction} from '../../../../strategies';
import {Strategies} from '../../../../strategies/keys';
import {STRATEGY} from '../../../../strategy-name.enum';
import {userWithoutReqObj} from '../../../fixtures/data/bearer-data';
import {MyAuthenticationSequence} from '../../../fixtures/sequences/authentication.sequence';
import {getApp} from '../helpers/helpers';

describe('getting autha strategy with options', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(givenAuthVerifier);
  beforeEach(givenSessions);

  it('should return 302 when client id is passed and passReqToCallback is set true', async () => {
    class TestController {
      @get('/test')
      @authenticate(STRATEGY.AUTHA, {
        endpoint: 'string',
        redirectUri: 'string',
        clientID: 'string',
        clientSecret: 'string',
        passReqToCallback: true,
      })
      test() {
        return 'test successful';
      }
    }

    app.controller(TestController);

    await whenIMakeRequestTo(server).get('/test').expect(302);
  });

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }

  async function givenAServer() {
    app = getApp();
    server = await app.getServer(RestServer);
  }

  function givenAuthVerifier() {
    app.bind(Strategies.Passport.AUTHA_VERIFIER).toProvider(AuthaVerifyProvider);
  }

  function givenSessions() {
    registerExpressMiddleware<SessionOptions>(
      app,
      Sessions as ExpressMiddlewareFactory<SessionOptions>,
      {
        cookieName: 'session',
        secret: 'random_string_goes_here',
        duration: 30 * 60 * 1000,
        activeDuration: 5 * 60 * 1000,
      },
      {
        chain: RestTags.ACTION_MIDDLEWARE_CHAIN,
      },
    );
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationSequence);
  }
});

class AuthaVerifyProvider implements Provider<VerifyFunction.AuthaFn> {
  constructor() {}

  value(): VerifyFunction.AuthaFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: AuthaStrategy.Profile,
      cd: AuthaStrategy.VerifyCallback,
      req?: Request,
    ) => {
      return userWithoutReqObj;
    };
  }
}
