import {TestOidcApplication} from '../fixtures';
import {Client} from '@loopback/testlab';
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
      .get('/interaction/login/test')
      .send()
      .expect(400, {
        error: {
          statusCode: 400,
          name: 'SessionNotFound',
          message: 'invalid_request',
        },
      });
  });

  it('should work with interaction', async () => {
    let interactionURL: string;
    // should create an interaction session
    let res = await client
      .get('/oidc/auth')
      .query({
        response_type: 'code',
        client_id: 'test',
        scope: 'openid',
        redirect_uri: 'http://localhost:8080',
        state: 'hello',
      })
      .send();

    interactionURL = res.headers['location'] ?? ('' as string);

    expect(res.headers['set-cookie']).toBeTruthy();
    expect(interactionURL).toMatch(/^\/interaction\/[^\/]+/);

    const cookies = createCookieStore();
    cookies.save(res.headers['set-cookie']);

    // should have a valid interaction session
    res = await client.get(interactionURL).set('cookie', cookies.get()).send().expect(200);
    expect(res.body.kind).toEqual('Interaction');
    expect(res.body.prompt.name).toEqual('login');
    expect(res.body.params.client_id).toEqual('test');

    // should authenticate
    res = await client
      .post(interactionURL)
      .set('cookie', cookies.get())
      .send({
        user: 'test',
        pwd: 'testpwd',
      })
      .expect(303);
    expect(res.headers['location']).toMatch(/\/oidc\/auth\/[^\/]+$/);
    interactionURL = getUrlPath(res.headers['location']);
    cookies.save(res.headers['set-cookie']);

    // should redirect to the consent endpoint
    res = await client.get(interactionURL).set('cookie', cookies.get()).send().expect(303);
    expect(res.headers['location']).toMatch(/\/consent\/[^\/]+/);
    interactionURL = res.headers['location'];
    cookies.save(res.headers['set-cookie']);

    // should have a login session
    res = await client.get(interactionURL).set('cookie', cookies.get()).send().expect(200);
    expect(res.body?.session?.accountId).toEqual('test');
    cookies.save(res.headers['set-cookie']);

    // should confirm the consent
    res = await client.post(`${interactionURL}/confirm`).set('cookie', cookies.get()).send().expect(302);
    expect(res.headers['location']).toMatch(/\/oidc\/auth\/[^\/]+$/);
    interactionURL = getUrlPath(res.headers['location']);
    cookies.save(res.headers['set-cookie']);

    // should redirect to redirect_uri endpoint
    res = await client.get(interactionURL).set('cookie', cookies.get()).send().expect(303);
    expect(res.headers['location']).toMatch(/\?code=[^\/]+/);
    cookies.save(res.headers['set-cookie']);

    // should return session info in "/me" route
    // res = await client.get('/oidc/me').set('cookie', cookies.get()).send(); //.expect(200);
    // expect(res.body.uid).toBeTruthy();
    // expect(res.body.accountId).toEqual('test');
  });
});
