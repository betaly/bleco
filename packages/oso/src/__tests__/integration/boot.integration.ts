import {OsoApp} from '../fixtures/application';
import {givenApp} from '../fixtures/support';

describe('Boot with OSO', () => {
  let app: OsoApp;

  beforeEach(async () => {
    app = await givenApp();
  });
  afterEach(async () => {
    if (app) await app.stop();
    (app as unknown) = undefined;
  });

  it('boots oso when app.boot() is called', () => {
    expect(app).toBeTruthy();
  });
});
