import {Application, BindingScope} from '@loopback/core';

import {Acl} from '../../acl';
import {DefaultEnforcerProvider} from '../../enforcers/default';
import {AclBindings} from '../../keys';
import {GLOBAL, GlobalActions, Org, OrgActions, TestData, givenApp} from '../../test';

describe('DefaultEnforcerStrategy', function () {
  let app: Application;
  let td: TestData;
  let enforcer: Acl;

  beforeAll(givenApplication);
  afterAll(() => app.stop());

  describe('isAllowed', function () {
    it('allows create organization for site member', async () => {
      const user = td.users.tom;
      expect(await enforcer.isAllowed(user, GlobalActions.create_orgs, GLOBAL)).toBe(true);
    });

    it('denies manage for regular user', async () => {
      const user = td.users.tom;
      expect(await enforcer.isAllowed(user, GlobalActions.manage, GLOBAL)).toBe(false);
    });
  });

  describe('authorize', function () {
    it('allows create organization for site member', async () => {
      const user = td.users.jerry;
      await enforcer.authorize(user, GlobalActions.create_orgs, GLOBAL);
    });

    it('denies delete for regular user', async () => {
      const user = td.users.jerry;
      await expect(enforcer.authorize(user, GlobalActions.manage, GLOBAL)).rejects.toThrow('ForbiddenError');
    });
  });

  describe('authorizedQuery', function () {
    it('should return the authorization filter', async () => {
      const user = td.users.jerry;
      const filter = await enforcer.authorizedQuery(user, OrgActions.read, Org);
      expect(filter).toEqual({
        model: Org.modelName,
        where: {
          or: [
            {
              'roles.principals.principalId': user.id,
              'roles.principals.principalType': user.constructor.name,
              'roles.permissions.action': OrgActions.read,
            },
            {
              'principals.principalId': user.id,
              'principals.principalType': user.constructor.name,
              'principals.roleId': {
                inq: ['member', 'owner'],
              },
            },
            {
              'global.principals.principalId': user.id,
              'global.principals.principalType': user.constructor.name,
              'global.principals.roleId': {
                inq: ['admin'],
              },
            },
          ],
        },
      });
    });
  });

  describe('authorizedActions', function () {
    it('should return the authorization actions', async () => {
      const actions = await enforcer.authorizedActions(td.users.jerry, td.orgs.tesla);
      expect(actions).toEqual(new Set(['read', 'list_repos', 'list_role_assignments']));
    });

    it('should return the authorization actions with custom roles', async () => {
      const actions = await enforcer.authorizedActions(td.users.tom, td.orgs.tesla);
      expect(actions).toEqual(
        new Set([
          'read',
          'list_repos',
          'create_role_assignments',
          'delete_role_assignments',
          'update_role_assignments',
          'list_role_assignments',
        ]),
      );
    });

    it('should return the authorization actions with more deeper relations roles', async () => {
      const actions = await enforcer.authorizedActions(td.users.jerry, td.issues.issueTeslaA1);
      expect(actions).toEqual(new Set(['read', 'close']));
    });
  });

  async function givenApplication() {
    ({app, td} = await givenApp(application => {
      application.bind(AclBindings.ENFORCER).toProvider(DefaultEnforcerProvider).inScope(BindingScope.SINGLETON);
    }));
    enforcer = await app.get(AclBindings.ACL);
  }
});
