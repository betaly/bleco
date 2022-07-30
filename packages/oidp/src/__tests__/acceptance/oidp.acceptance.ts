import {Client} from '@loopback/testlab';
import {OidpBindings} from '../../keys';
import {OidcRepository} from '../../repositories';
import {OidcProvider} from '../../types';
import {TestOidcApplication} from '../fixtures';
import {setupApplication} from '../support';

describe('OIDP - startup with oidc exposing', function () {
  let app: TestOidcApplication;
  let client: Client;

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should return discovery metadata in .well-known endpoint', async () => {
    const response = await client.get('/oidc/.well-known/openid-configuration').expect(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body?.authorization_endpoint).toEqual(`${app.restServer.url}/oidc/auth`);
    expect(response.body?.grant_types_supported).toEqual(['authorization_code', 'refresh_token']);
    expect(response.body?.response_types_supported).toEqual(['code']);
    expect(response.body.authorization_endpoint).toMatch(/:\d+\/oidc\/auth/);
  });

  it('should save a grant through the adapter', async () => {
    const provider = await app.get<OidcProvider>(OidpBindings.PROVIDER);
    const repo = await app.getRepository(OidcRepository);

    const grant = new provider.Grant({
      clientId: 'test',
      accountId: 'test',
    });
    const grantId = await grant.save();

    expect(await repo.findPayload('Grant', grantId)).toBeTruthy();
  });
});
