import {Application, inject} from '@loopback/core';
import {post, requestBody} from '@loopback/openapi-v3';
import {RestServer} from '@loopback/rest';
import {Client, createClientForHandler, expect} from '@loopback/testlab';

import {authenticateClient} from '../../../../decorators';
import {AuthenticationBindings} from '../../../../keys';
import {Strategies} from '../../../../strategies/keys';
import {STRATEGY} from '../../../../strategy-name.enum';
import {IAuthClient} from '../../../../types';
import {ClientPasswordVerifyProvider} from '../../../fixtures/providers/passport-client.provider';
import {MyAuthenticationMiddlewareSequence} from '../../../fixtures/sequences/authentication-middleware.sequence';
import {getApp} from '../helpers/helpers';

describe('Client-password strategy using Middleware Sequence', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(givenAuthVerifier);

  it('should return status 200 when options.passRequestToCallback is set true', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_CLIENT) // tslint:disable-next-line: no-shadowed-variable
        private readonly client: IAuthClient | undefined,
      ) {}

      @authenticateClient(STRATEGY.CLIENT_PASSWORD, {passReqToCallback: true})
      @post('/test')
      test(@requestBody() body: {client_id: string; client_secret: string}) {
        return this.client;
      }
    }

    app.controller(TestController);

    const client = await whenIMakeRequestTo(server)
      .post('/test')
      .send({client_id: 'some id', client_secret: 'some secret'})
      .expect(200);

    expect(client.body).to.have.property('clientId');
    expect(client.body).to.have.property('clientSecret');
    expect(client.body.clientId).to.equal('some id');
    expect(client.body.clientSecret).to.equal('some secret');
  });

  it('should return status 200 when options.passRequestToCallback is set false', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_CLIENT) // tslint:disable-next-line: no-shadowed-variable
        private readonly client: IAuthClient | undefined,
      ) {}

      @post('/test')
      @authenticateClient(STRATEGY.CLIENT_PASSWORD, {passReqToCallback: false})
      test(@requestBody() body: {client_id: string; client_secret: string}) {
        return this.client;
      }
    }

    app.controller(TestController);

    const client = await whenIMakeRequestTo(server)
      .post('/test')
      .send({client_id: 'some id', client_secret: 'some secret'})
      .expect(200);

    expect(client.body).to.have.property('clientId');
    expect(client.body).to.have.property('clientSecret');
    expect(client.body.clientId).to.equal('some id');
    expect(client.body.clientSecret).to.equal('some secret');
  });

  it('should return status 401 when options.passRequestToCallback is set true', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_CLIENT) // tslint:disable-next-line: no-shadowed-variable
        private readonly client: IAuthClient | undefined,
      ) {}

      @post('/test')
      @authenticateClient(STRATEGY.CLIENT_PASSWORD, {passReqToCallback: true})
      async test(
        @requestBody()
        body: {
          client_id: string;
          client_secret: string;
        },
      ) {
        return this.client;
      }
    }

    app.controller(TestController);

    await whenIMakeRequestTo(server).post('/test').send({client_id: '', client_secret: 'some secret'}).expect(401);
  });

  it('should return status 401 when options.passRequestToCallback is set false', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_CLIENT) // tslint:disable-next-line: no-shadowed-variable
        private readonly client: IAuthClient | undefined,
      ) {}

      @post('/test')
      @authenticateClient(STRATEGY.CLIENT_PASSWORD, {passReqToCallback: false})
      async test(
        @requestBody()
        body: {
          client_id: string;
          client_secret: string;
        },
      ) {
        return this.client;
      }
    }

    app.controller(TestController);

    await whenIMakeRequestTo(server).post('/test').send({client_id: '', client_secret: 'some secret'}).expect(401);
  });

  it('should return status 200 when pass client_id and client_secret in headers', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_CLIENT) // tslint:disable-next-line: no-shadowed-variable
        private readonly client: IAuthClient | undefined,
      ) {}

      @post('/test')
      @authenticateClient(STRATEGY.CLIENT_PASSWORD, {passReqToCallback: false})
      test(@requestBody() body: {client_id: string; client_secret: string}) {
        return this.client;
      }
    }

    app.controller(TestController);

    const client = await whenIMakeRequestTo(server)
      .post('/test')
      .set({client_id: 'some id', client_secret: 'some secret'})
      .send({})
      .expect(200);

    expect(client.body).to.have.property('clientId');
    expect(client.body).to.have.property('clientSecret');
    expect(client.body.clientId).to.equal('some id');
    expect(client.body.clientSecret).to.equal('some secret');
  });

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }

  async function givenAServer() {
    app = getApp();
    server = await app.getServer(RestServer);
  }

  function givenAuthVerifier() {
    app.bind(Strategies.Passport.OAUTH2_CLIENT_PASSWORD_VERIFIER).toProvider(ClientPasswordVerifyProvider);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationMiddlewareSequence);
  }
});

describe('integration test for client-password and no verifier using Middleware Sequence', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);

  it('should return status 401 as this strategy is not implemented', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_CLIENT) // tslint:disable-next-line: no-shadowed-variable
        private readonly client: IAuthClient | undefined,
      ) {}

      @post('/test')
      @authenticateClient(STRATEGY.CLIENT_PASSWORD, {passReqToCallback: true})
      test(
        @requestBody()
        body: {
          client_id: string;
          client_secret: string;
        },
      ) {
        return this.client;
      }
    }

    app.controller(TestController);

    await whenIMakeRequestTo(server)
      .post('/test')
      .send({client_id: 'some id', client_secret: 'some secret'})
      .expect(401);
  });

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }

  async function givenAServer() {
    app = getApp();
    server = await app.getServer(RestServer);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationMiddlewareSequence);
  }
});
