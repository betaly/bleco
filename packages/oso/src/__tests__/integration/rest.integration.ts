import {Client} from '@loopback/testlab';
import {OsoApp} from '../fixtures/application';
import {givenAppAndClient} from '../fixtures/support';

describe('Rest with OSO', () => {
  let app: OsoApp;
  let client: Client;

  beforeEach(async () => {
    ({app, client} = await givenAppAndClient());
  });
  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  it('creates open Org', () => {
    expect(client).toBeTruthy();
  });
});
