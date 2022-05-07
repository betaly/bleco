import {GitClubApplication} from '../fixtures/application';
import {givenApp} from '../fixtures/support';

describe('Application Integration', function () {
  let app: GitClubApplication;
  beforeAll(async () => {
    app = await givenApp();
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should mount components', function () {
    expect(app.isBound('models.User')).toBeTruthy();
    expect(app.isBound('models.Org')).toBeTruthy();
    expect(app.isBound('repositories.UserRepository')).toBeTruthy();
    expect(app.isBound('repositories.OrgRepository')).toBeTruthy();
  });
});
