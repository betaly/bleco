import {AclBindings, AclTags} from '../../keys';
import {GitClubApplication, fixturesPath} from '../../test';

describe('Acl booter integration tests', () => {
  let app: GitClubApplication;

  beforeEach(getApp);

  it('boots connections when app.boot() is called', async () => {
    const expectedBindings = [`${AclBindings.POLICIES}.Org`];
    await app.boot();
    const bindings = app.findByTag(AclTags.POLICY).map(b => b.key);
    for (const key of expectedBindings) {
      expect(bindings).toContain(key);
    }
  });

  async function getApp() {
    const MyApp = require(fixturesPath('application')).GitClubApplication;
    app = new MyApp();
  }
});
