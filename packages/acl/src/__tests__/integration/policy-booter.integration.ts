import {AclApp} from '../fixtures/application';
import {AclBindings, AclTags} from '../../keys';
import {fixturesPath} from '../support';

describe('TypeORM connection booter integration tests', () => {
  let app: AclApp;

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
    const MyApp = require(fixturesPath('application')).AclApp;
    app = new MyApp();
  }
});
