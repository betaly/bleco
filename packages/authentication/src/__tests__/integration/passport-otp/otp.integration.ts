import {Client, createClientForHandler, expect} from '@loopback/testlab';
import {Application, inject} from '@loopback/core';
import {RestServer} from '@loopback/rest';
import {post, requestBody} from '@loopback/openapi-v3';
import {givenApp} from '../helpers/helpers';
import {AuthenticationBindings, Strategies} from '../../../keys';
import {IAuthUser} from '../../../types';
import {authenticate} from '../../../decorators';
import {STRATEGY} from '../../../strategy-name.enum';
import {MyAuthenticationSequence} from '../../fixtures/sequences/authentication.sequence';
import {OtpVerifyProvider} from '../../fixtures/providers/otp-auth.provider';

describe('OTP strategy', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);
  beforeEach(getAuthVerifier);

  it('should return 422 bad request when no user data is sent', async () => {
    class TestController {
      @post('/auth/otp')
      @authenticate(STRATEGY.OTP)
      test(@requestBody() body: {code: string; contact: string; token: string}) {
        return 'test successful';
      }
    }

    app.controller(TestController);

    await whenIMakeRequestTo(server).post('/auth/otp').send({}).expect(401);
  });

  it('should return status 200 for no options', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_USER) // tslint:disable-next-line: no-shadowed-variable
        private readonly user: IAuthUser | undefined,
      ) {}

      @post('/auth/otp/no-options')
      @authenticate(STRATEGY.OTP)
      test(
        @requestBody()
        body: {
          code: string;
          contact: string;
          token: string;
        },
      ) {
        return this.user;
      }
    }

    app.controller(TestController);

    const res = await whenIMakeRequestTo(server)
      .post('/auth/otp/no-options')
      .send({
        code: '111111',
        contact: 'torry@microloop.com',
        token: 'hello token',
      })
      .expect(200);

    expect(res.body).to.have.property('email');
    expect(res.body.email).to.equal('torry@microloop.com');
  });

  it('should return the user credentials are sent via body and options are passed with passRequestCallback true', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_USER) // tslint:disable-next-line: no-shadowed-variable
        private readonly user: IAuthUser | undefined,
      ) {}

      @post('/auth/otp/passReqToCallback')
      @authenticate(STRATEGY.OTP, {
        passReqToCallback: true,
      })
      async test(
        @requestBody()
        body: {
          code: string;
          contact: string;
          token: string;
        },
      ) {
        return this.user;
      }
    }

    app.controller(TestController);

    const res = await whenIMakeRequestTo(server)
      .post('/auth/otp/passReqToCallback')
      .send({
        code: '222222',
        contact: 'torry@microloop.com',
        token: 'hello token',
      })
      .expect(200);

    expect(res.body).to.have.property('email');
    expect(res.body.email).to.equal('torry@microloop.com');
  });

  it('should return the user which was passed via body and options are passed with passRequestCallback false', async () => {
    class TestController {
      constructor(
        @inject(AuthenticationBindings.CURRENT_USER)
        private readonly user: IAuthUser | undefined,
      ) {}

      @post('/auth/otp/passReqToCallback-false')
      @authenticate(STRATEGY.OTP, {
        passReqToCallback: false,
      })
      async test(
        @requestBody()
        body: {
          code: string;
          contact: string;
          token: string;
        },
      ) {
        return this.user;
      }
    }

    app.controller(TestController);

    const res = await whenIMakeRequestTo(server)
      .post('/auth/otp/passReqToCallback-false')
      .send({
        code: '333333',
        contact: 'torry@microloop.com',
        token: 'hello token',
      })
      .expect(200);

    expect(res.body).to.have.property('email');
    expect(res.body.email).to.equal('torry@microloop.com');
  });

  it('should return the user passed via verifier when no options are passed', async () => {
    class TestController {
      @post('/test')
      @authenticate(STRATEGY.OTP)
      async test(
        @requestBody()
        body: {
          code: string;
          contact: string;
          token: string;
        },
      ) {
        return body;
      }
    }

    app.controller(TestController);

    await whenIMakeRequestTo(server)
      .post('/test')
      .send({
        code: '',
        contact: 'torry@microloop.com',
        token: 'hello token',
      })
      .expect(401);
  });

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }

  async function givenAServer() {
    app = givenApp();
    server = await app.getServer(RestServer);
  }

  function getAuthVerifier() {
    app.bind(Strategies.Passport.OTP_VERIFIER).toProvider(OtpVerifyProvider);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationSequence);
  }
});

describe('OTP strategy with no verifier', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);
  beforeEach(givenAuthenticatedSequence);

  it('should return the user passed via verifier and options are passed with passRequestCallback false', async () => {
    class TestController {
      options = {
        passRequestToCallback: false,
      };

      @post('/test')
      @authenticate(STRATEGY.OTP)
      async test(
        @requestBody()
        body: {
          code: string;
          contact: string;
          token: string;
        },
      ) {
        return body;
      }
    }

    app.controller(TestController);

    await whenIMakeRequestTo(server)
      .post('/test')
      .send({
        code: '123456',
        contact: 'torry@microloop.com',
        token: 'hello token',
      })
      .expect(401);
  });

  function whenIMakeRequestTo(restServer: RestServer): Client {
    return createClientForHandler(restServer.requestHandler);
  }

  async function givenAServer() {
    app = givenApp();
    server = await app.getServer(RestServer);
  }

  function givenAuthenticatedSequence() {
    // bind user defined sequence
    server.sequence(MyAuthenticationSequence);
  }
});
