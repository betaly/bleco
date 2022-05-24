import {Application} from '@loopback/core';
import {AclMixin} from '../../mixins';

describe('AclMixin unit tests', () => {
  class AppWithAcl extends AclMixin(Application) {}

  let app: AppWithAcl;

  beforeEach(getApp);

  it('adds essential members', async () => {
    expect(app).toHaveProperty('policy');
    expect(app).toHaveProperty('getPolicy');
  });

  async function getApp() {
    app = new AppWithAcl();
  }
});
