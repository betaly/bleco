import {Application, Provider} from '@loopback/core';
import {get} from '@loopback/openapi-v3';
import {Request, RestServer} from '@loopback/rest';
import {Client, createClientForHandler} from '@loopback/testlab';
import AppleStrategy, {DecodedIdToken} from 'passport-apple';

import {authenticate} from '../../../../decorators';
import {VerifyFunction} from '../../../../strategies';
import {Strategies} from '../../../../strategies/keys';
import {STRATEGY} from '../../../../strategy-name.enum';
import {userWithoutReqObj} from '../../../fixtures/data/bearer-data';
import {MyAuthenticationMiddlewareSequence} from '../../../fixtures/sequences/authentication-middleware.sequence';
import {getApp} from '../helpers/helpers';

describe('getting apple oauth2 strategy with options using Middleware Sequence', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);
  afterEach(closeServer);

  it('should return 302 when client id is passed and passReqToCallback is set true', async () => {
    getAuthVerifier();
    class TestController {
      @get('/test')
      @authenticate(STRATEGY.APPLE_OAUTH2, {
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

  function getAuthVerifier() {
    app.bind(Strategies.Passport.APPLE_OAUTH2_VERIFIER).toProvider(AppleAuthVerifyProvider);
  }

  function closeServer() {
    app.close();
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationMiddlewareSequence);
  }
});

class AppleAuthVerifyProvider implements Provider<VerifyFunction.AppleAuthFn> {
  constructor() {}

  value(): VerifyFunction.AppleAuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      decodedIdToken: DecodedIdToken,
      profile: AppleStrategy.Profile,
      cd: AppleStrategy.VerifyCallback,
      req?: Request,
    ) => {
      return userWithoutReqObj;
    };
  }
}
