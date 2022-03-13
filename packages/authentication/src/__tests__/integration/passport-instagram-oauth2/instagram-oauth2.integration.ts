import {Client, createClientForHandler} from '@loopback/testlab';
import {RestServer} from '@loopback/rest';
import {Application, Provider} from '@loopback/core';
import {get} from '@loopback/openapi-v3';
import {authenticate} from '../../../decorators';
import {STRATEGY} from '../../../strategy-name.enum';
import {givenApp} from '../helpers/helpers';
import {MyAuthenticationSequence} from '../../fixtures/sequences/authentication.sequence';
import {Strategies} from '../../../strategies';
import {VerifyCallback, VerifyFunction} from '../../../strategies';
import {userWithoutReqObj} from '../../fixtures/data/bearer-data';
import * as InstagramStrategy from 'passport-instagram';
import {Request} from '@loopback/rest';
import {set} from 'lodash';

describe('getting instagram oauth2 strategy with options', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(getAuthVerifier);

  it('should return 200 when client id is passed and passReqToCallback is set true', async () => {
    set(app.options, 'auth.instagram', {
      clientID: 'string',
      clientSecret: 'string',
    });
    class TestController {
      @get('/test')
      @authenticate(STRATEGY.INSTAGRAM_OAUTH2, {
        passReqToCallback: true,
      })
      test() {
        return 'test successful';
      }
    }

    app.controller(TestController);

    await whenIMakeRequestTo(server).get('/test').expect(200);
  });

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }

  async function givenAServer() {
    app = givenApp();
    server = await app.getServer(RestServer);
  }

  function getAuthVerifier() {
    app.bind(Strategies.Passport.INSTAGRAM_OAUTH2_VERIFIER).toProvider(InstagramAuthVerifyProvider);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationSequence);
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
