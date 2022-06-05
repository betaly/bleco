import {Application, BindingScope, Context, invokeMethod} from '@loopback/core';
import {SecurityBindings, securityId} from '@loopback/security';
import {acls} from '../../decorators';
import {DefaultEnforcerProvider} from '../../enforcers/default';
import {AclBindings} from '../../keys';
import {DefaultSite, givenApp, Org, OrgActions, OrgRoles, SiteActions, TestData} from '../../test';
import {User} from '../../test/fixtures/components/account';

describe('Authorization', function () {
  let app: Application;
  let td: TestData;

  beforeAll(givenApplicationAndAuthorizer);
  afterAll(() => app.stop());

  it('allows create organization for site member', async () => {
    const user = td.users.tom;
    const {reqCtx, controller} = givenRequestContext(user);
    const orderId = await invokeMethod(controller, 'create', reqCtx, [{name: 'Org 1'}]);
    expect(orderId).toEqual('org-1');
  });

  it('denies delete for regular user', async () => {
    const user = td.users.tom;
    const {reqCtx, controller} = givenRequestContext(user);
    const result = invokeMethod(controller, 'delete', reqCtx, ['org-1']);
    await expect(result).rejects.toMatchObject({
      statusCode: 403,
      message: 'Access denied',
    });
  });

  it('allows read organization', async () => {
    const user = td.users.tom;
    const {reqCtx, controller} = givenRequestContext(user);
    const roleMappingService = await app.get(AclBindings.ROLE_MAPPING_SERVICE);
    const orderId = await invokeMethod(controller, 'create', reqCtx, [{name: 'Org N'}]);
    // grant `owner` role in `Org` to `tom`. It has usually done in server side after create org.
    await roleMappingService.add(user, OrgRoles.owner, new Org({id: orderId}));
    const result = await invokeMethod(controller, 'read', reqCtx, [orderId]);
    expect(result).toEqual({id: orderId, name: 'Org N'});
  });

  class OrgController {
    orgs: Partial<Org>[] = [];

    @acls.authorize(SiteActions.create_orgs, DefaultSite)
    async create(org: Partial<Org>) {
      org.id = `org-${this.orgs.length + 1}`;
      this.orgs.push(org);
      return org.id;
    }

    @acls.authorize(OrgActions.read, Org, 0)
    async read(orgId: string) {
      return this.orgs.find(o => o.id === orgId);
    }

    @acls.authorize(SiteActions.manage, DefaultSite)
    async delete(orgId: string) {
      const index = this.orgs.findIndex(o => o.id === orgId);
      if (index < 0) return false;
      this.orgs.splice(index, 1);
      return true;
    }
  }

  async function givenApplicationAndAuthorizer() {
    ({app, td} = await givenApp(application => {
      application.bind(AclBindings.ENFORCER).toProvider(DefaultEnforcerProvider).inScope(BindingScope.SINGLETON);
    }));
  }

  function givenRequestContext(user: User) {
    const reqCtx = new Context(app);
    reqCtx.bind(SecurityBindings.USER).to({[securityId]: user.id, name: user.name});
    const controller = new OrgController();
    return {reqCtx, controller};
  }
});
