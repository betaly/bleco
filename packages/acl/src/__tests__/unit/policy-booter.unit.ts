import {Application} from '@loopback/core';
import {AclMixin, ApplicationWithAcl} from '../../mixins';
import {PolicyBooter, PolicyDefaults} from '../../booters';
import {AclBindings, AclTags} from '../../keys';
import {componentsPath, fixturesPath} from '../../test';

describe('Acl policy booter unit tests', function () {
  class AppWithAcl extends AclMixin(Application) {}

  let app: AppWithAcl;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stub: jest.MockInstance<any, any>;

  beforeEach(() => {
    app = new AppWithAcl();
  });

  beforeEach(() => {
    stub = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    stub.mockRestore();
  });

  it('gives a warning if called on an app without AclMixin', async () => {
    const normalApp = new Application();
    const booterInst = new PolicyBooter(normalApp as ApplicationWithAcl, fixturesPath());
    booterInst.discovered = [fixturesPath('org.policy.ts')];
    await booterInst.load();
    expect(stub).toHaveBeenCalledWith(
      'app.policy() function is needed for AclPolicyBooter. You can add it to your Application using AclMixin from @bleco/acl.',
    );
  });

  it('user PolicyDefinitions for "options" if none are given', async () => {
    const booterInst = new PolicyBooter(app, fixturesPath());
    expect(booterInst.options).toEqual(PolicyDefaults);
  });

  it('overrides defaults with provided options and uses defaults for the rest', async () => {
    const options = {
      dirs: ['test'],
      extensions: ['.ext1'],
    };

    const expected = Object.assign({}, options, {
      nested: PolicyDefaults.nested,
    });

    const boostInst = new PolicyBooter(app, fixturesPath(), options);
    expect(boostInst.options).toEqual(expected);
  });

  it('binds policies during the load phase', async () => {
    const expected = [`${AclBindings.POLICIES}.Org`];
    const booterInst = new PolicyBooter(app, fixturesPath());
    booterInst.discovered = [componentsPath('gitclub', 'policies', 'org.policy.ts')];
    await booterInst.load();

    const policies = app.findByTag(AclTags.POLICY);
    const keys = policies.map(p => p.key);
    expect(keys).toEqual(expected);
  });
});
