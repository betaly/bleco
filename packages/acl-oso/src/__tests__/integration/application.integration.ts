import {GitClubApplication} from '../fixtures/application';
import {givenApp} from '../fixtures/support';
import {AclBindings, PolicyManager} from '@bleco/acl';

describe('Application Integration', function () {
  let app: GitClubApplication;
  beforeAll(async () => {
    app = await givenApp();
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should mount components', function () {
    const policyManager = app.getSync(AclBindings.POLICY_MANAGER);
    expect(policyManager).toBeInstanceOf(PolicyManager);
    expect(policyManager.policies.length).toBeGreaterThan(0);
  });
});
