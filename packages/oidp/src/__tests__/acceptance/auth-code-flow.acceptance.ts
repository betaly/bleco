import {Client} from '@loopback/testlab';
import qs from 'qs';

import {TestOidcApplication} from '../fixtures';
import {createCookieStore, getUrlPath, setupApplication} from '../support';

describe('OIDP - authorization code flow', function () {
  let app: TestOidcApplication;
  let client: Client;

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should return SessionNotFound error', async () => {
    await client
      .get('/interaction/test')
      .send()
      .expect(400, {
        error: {
          statusCode: 400,
          name: 'SessionNotFound',
          message: 'invalid_request',
        },
      });
  });

  describe('in flow sequence', () => {
    let interactionURL: string;
    let cookies: ReturnType<typeof createCookieStore>;
    let code: string;
    let accessToken: string;
    let tokenType: string;

    beforeAll(async () => {
      cookies = createCookieStore();
    });

    it('should create an interaction session', async () => {
      const res = await client
        .get('/oidc/auth')
        .query({
          response_type: 'code',
          client_id: 'test',
          scope: 'openid',
          redirect_uri: 'http://localhost:8080',
        })
        .send();

      interactionURL = res.headers['location'] ?? ('' as string);
      expect(res.headers['set-cookie']).toBeTruthy();
      expect(interactionURL).toMatch(/^\/interaction\/[^\/]+/);
      cookies.save(res.headers['set-cookie']);
    });

    it('should have a valid interaction session', async () => {
      const res = await client.get(interactionURL).set('cookie', cookies.get()).send().expect(200);
      expect(res.body.kind).toEqual('Interaction');
      expect(res.body.prompt.name).toEqual('login');
      expect(res.body.params.client_id).toEqual('test');
    });

    it('should authenticate', async () => {
      const res = await client
        .post(`${interactionURL}/login`)
        .set('cookie', cookies.get())
        .send({
          user: 'test',
          pwd: 'testpwd',
        })
        .expect(303);
      expect(res.headers['location']).toMatch(/\/oidc\/auth\/[^\/]+$/);
      interactionURL = getUrlPath(res.headers['location']);
      cookies.save(res.headers['set-cookie']);
    });

    it('should redirect to the consent endpoint', async () => {
      const res = await client.get(interactionURL).set('cookie', cookies.get()).send().expect(303);
      expect(res.headers['location']).toMatch(/\/interaction\/[^\/]+/);
      interactionURL = res.headers['location'];
      cookies.save(res.headers['set-cookie']);
    });

    it('should have a login session', async () => {
      const res = await client.get(interactionURL).set('cookie', cookies.get()).send().expect(200);
      expect(res.body?.session?.accountId).toEqual('test');
      cookies.save(res.headers['set-cookie']);
    });

    it('should confirm consent', async () => {
      const res = await client.post(`${interactionURL}/confirm`).set('cookie', cookies.get()).send().expect(302);
      expect(res.headers['location']).toMatch(/\/oidc\/auth\/[^\/]+$/);
      interactionURL = getUrlPath(res.headers['location']);
      cookies.save(res.headers['set-cookie']);
    });

    it('should redirect to redirect_uri endpoint', async () => {
      // should redirect to redirect_uri endpoint
      const res = await client.get(interactionURL).set('cookie', cookies.get()).send().expect(303);
      expect(res.headers['location']).toMatch(/\?code=[^\/]+/);
      cookies.save(res.headers['set-cookie']);
      const parsed = qs.parse(new URL(res.headers['location']).searchParams.toString());
      code = parsed.code as string;
    });

    it('should exchange the code for an access token', async () => {
      const res = await client
        .post('/oidc/token')
        .set('cookie', cookies.get())
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Basic ${Buffer.from('test:testsecret').toString('base64')}`)
        .send({
          grant_type: 'authorization_code',
          client_id: 'test',
          redirect_uri: 'http://localhost:8080',
          code,
        })
        .expect(200);
      expect(res.body.access_token).toBeTruthy();
      expect(res.body.id_token).toBeTruthy();

      accessToken = res.body.access_token;
      tokenType = res.body.token_type;
    });

    it('should get user info', async () => {
      const res = await client.get('/oidc/me').set('Authorization', `${tokenType} ${accessToken}`).expect(200);
      expect(res.body.sub).toEqual('test');
    });
  });
});
