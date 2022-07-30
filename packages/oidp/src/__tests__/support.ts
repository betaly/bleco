import {ApplicationConfig} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';
import hyperid from 'hyperid';
import {TestOidcApplication} from './fixtures';

const cookie = require('superagent-cookie');

export const genId = hyperid();

export const testdb: juggler.DataSource = new juggler.DataSource({
  name: 'db',
  connector: 'memory',
});

function givenOidpConfiguration() {
  return {
    baseUrl: 'http://localhost:3000',
    path: '/oidc',
    oidc: {
      clients: [
        {
          client_id: 'test',
          client_name: 'test',
          client_secret: 'testsecret',
          application_type: 'web',
          redirect_uris: ['http://localhost:8080'],
          // token_endpoint_auth_method: 'none',
        },
      ],
      features: {
        devInteractions: {
          enabled: false,
        },
      },
      responseTypes: ['code'],
      pkce: {
        methods: ['S256'],
        required: () => false,
      },
      ttl: {
        AccessToken: 60 * 60,
        AuthorizationCode: 10 * 60,
        BackchannelAuthenticationRequest: 10 * 60,
        ClientCredentials: 10 * 60,
        DeviceCode: 10 * 60,
        Grant: 14 * 24 * 60 * 60,
        IdToken: 60 * 60,
        Interaction: 60 * 60,
        RefreshToken: 14 * 24 * 60 * 60,
        Session: 14 * 24 * 60 * 60,
      },
    },
  };
}

export async function setupApplication(config: ApplicationConfig = {}): Promise<AppWithClient> {
  const app = new TestOidcApplication({
    ...config,
    rest: givenHttpServerConfig(),
    oidp: givenOidpConfiguration(),
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: TestOidcApplication;
  client: Client;
}

export function getUrlPath(url: string) {
  return new URL(url).pathname;
}

export function createCookieStore(name = 'test') {
  return {
    save(items: string[]) {
      if (items?.length) {
        cookie.save(items, name);
      }
    },
    get() {
      return cookie.use(name);
    },
  };
}
