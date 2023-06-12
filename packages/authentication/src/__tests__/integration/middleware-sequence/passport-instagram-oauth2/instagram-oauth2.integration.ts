import {Application, Provider} from '@loopback/core';
import {get} from '@loopback/openapi-v3';
import {Request, RestServer} from '@loopback/rest';
import {Client, createClientForHandler} from '@loopback/testlab';
import * as InstagramStrategy from 'passport-instagram';

import {authenticate} from '../../../../decorators';
import {VerifyCallback, VerifyFunction} from '../../../../strategies';
import {Strategies} from '../../../../strategies/keys';
import {STRATEGY} from '../../../../strategy-name.enum';
import {userWithoutReqObj} from '../../../fixtures/data/bearer-data';
import {MyAuthenticationMiddlewareSequence} from '../../../fixtures/sequences/authentication-middleware.sequence';
import {getApp} from '../helpers/helpers';

describe('getting instagram oauth2 strategy with options using Middleware Sequence', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(givenAuthVerifier);

  it('should return 302 when client id is passed and passReqToCallback is set true', async () => {
    class TestController {
      @get('/test')
      @authenticate(STRATEGY.INSTAGRAM_OAUTH2)
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
    app = getApp({
      instagram: {
        callbackURL: '',
        clientID: 'string',
        clientSecret: 'string',
        passReqToCallback: true,
      },
    });
    server = await app.getServer(RestServer);
  }

  function givenAuthVerifier() {
    app.bind(Strategies.Passport.INSTAGRAM_OAUTH2_VERIFIER).toProvider(InstagramAuthVerifyProvider);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationMiddlewareSequence);
  }
});

class InstagramAuthVerifyProvider implements Provider<VerifyFunction.InstagramAuthFn> {
  constructor() {}

  value(): VerifyFunction.InstagramAuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: InstagramStrategy.Profile,
      cd: VerifyCallback,
      req?: Request,
    ) => {
      return userWithoutReqObj;
    };
  }
}
