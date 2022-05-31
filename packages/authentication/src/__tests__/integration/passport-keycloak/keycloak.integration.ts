import {Application, Provider} from '@loopback/core';
import {get} from '@loopback/openapi-v3';
import {Request, RestServer} from '@loopback/rest';
import {Client, createClientForHandler} from '@loopback/testlab';
import {set} from 'lodash';
import {authenticate} from '../../../decorators';
import {Keycloak, VerifyFunction} from '../../../strategies';
import {Strategies} from '../../../strategies/keys';
import {STRATEGY} from '../../../strategy-name.enum';
import {IAuthUser} from '../../../types';
import {userWithoutReqObj} from '../../fixtures/data/bearer-data';
import {MyAuthenticationSequence} from '../../fixtures/sequences/authentication.sequence';
import {givenApp} from '../helpers/helpers';

describe('getting keycloak oauth2 strategy with options', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(getAuthVerifier);

  it('should return 200 when host and client id is passed and passReqToCallback is set true', async () => {
    set(app.options, 'auth.keycloak', {
      host: 'localhost',
      realm: 'localhost',
      callbackURL: 'localhost',
      authorizationURL: 'localhost',
      tokenURL: 'localhost',
      userInfoURL: 'localhost',
      clientID: 'string',
      clientSecret: 'string',
    });
    class TestController {
      @get('/test')
      @authenticate(STRATEGY.KEYCLOAK, {
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
    app.bind(Strategies.Passport.KEYCLOAK_VERIFIER).toProvider(KeycloakAuthVerifyProvider);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationSequence);
  }
});

class KeycloakAuthVerifyProvider implements Provider<VerifyFunction.KeycloakAuthFn> {
  constructor() {}

  value(): VerifyFunction.KeycloakAuthFn {
    return async (
      accessToken: string,
      refreshToken: string,
      profile: Keycloak.Profile,
      cd: (err?: string | Error, user?: IAuthUser) => void,
      req?: Request,
    ) => {
      return userWithoutReqObj;
    };
  }
}
