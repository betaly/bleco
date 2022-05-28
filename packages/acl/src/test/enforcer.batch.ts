import {AppInit} from './types';
import {
  DefaultSite,
  GitClubApplication,
  Org,
  OrgManagerPermissions,
  OrgPermissions,
  OrgPolicy,
  OrgRepository,
  OrgRoles,
  RepoPermissions,
  SitePermissions,
  TestData,
} from './fixtures';
import {givenApp} from './support';
import {Enforcer} from '../enforcer';
import {AclBindings} from '../keys';

export function testEnforcerBatch(init?: AppInit) {
  describe('Enforcer Batch', () => {
    let app: GitClubApplication;
    let td: TestData;
    let enforcer: Enforcer;

    beforeEach(async () => {
      ({app, td} = await givenApp(init));
      enforcer = await app.get(AclBindings.ENFORCER_SERVICE);
    });

    afterEach(async () => {
      await app.stop();
    });

    describe('basic', function () {
      it('should be able to start the application', async () => {
        expect(app).toBeDefined();
        expect(app.state).toBe('started');
      });
    });

    describe('#isAllow', function () {
      it('builtin roles', async () => {
        const {users, orgs} = td;
        expect(await enforcer.isAllowed(users.musk, OrgPermissions.create_repos, orgs.tesla)).toBe(true);
        expect(await enforcer.isAllowed(users.jerry, OrgPermissions.create_repos, orgs.tesla)).toBe(false);
      });

      it('custom roles', async () => {
        const {users, orgs} = td;
        expect(await enforcer.isAllowed(users.tom, OrgPermissions.list_repos, orgs.tesla)).toBe(true);
        expect(await enforcer.isAllowed(users.tom, OrgPermissions.create_repos, orgs.tesla)).toBe(false);
      });

      it('parent roles', async () => {
        const {users, repos} = td;
        expect(await enforcer.isAllowed(users.musk, RepoPermissions.create_role_assignments, repos.repoTeslaA)).toBe(
          true,
        );
        expect(await enforcer.isAllowed(users.jerry, RepoPermissions.create_role_assignments, repos.repoTeslaA)).toBe(
          false,
        );
      });

      it('static resource', async () => {
        const {users} = td;
        expect(await enforcer.isAllowed(users.god, SitePermissions.manage, DefaultSite)).toBe(true);
        expect(await enforcer.isAllowed(users.ava, SitePermissions.manage, DefaultSite)).toBe(false);
        expect(await enforcer.isAllowed(users.god, SitePermissions.create_orgs, DefaultSite)).toBe(true);
        expect(await enforcer.isAllowed(users.ava, SitePermissions.create_orgs, DefaultSite)).toBe(true);
      });
    });

    describe('#authorize', function () {
      it('builtin roles', async () => {
        const {users, orgs} = td;
        await enforcer.authorize(users.musk, OrgPermissions.create_repos, orgs.tesla);
        await expect(enforcer.authorize(users.jerry, OrgPermissions.create_repos, orgs.tesla)).rejects.toThrow(
          /Oso ForbiddenError/,
        );
      });

      it('custom roles', async () => {
        const {users, orgs} = td;
        await enforcer.authorize(users.tom, OrgPermissions.list_repos, orgs.tesla);
        await expect(enforcer.authorize(users.tom, OrgPermissions.create_repos, orgs.tesla)).rejects.toThrow(
          /Oso ForbiddenError/,
        );
      });

      it('parent roles', async () => {
        const {users, repos} = td;
        await enforcer.authorize(users.musk, RepoPermissions.create_role_assignments, repos.repoTeslaA);
        await expect(
          enforcer.authorize(users.jerry, RepoPermissions.create_role_assignments, repos.repoTeslaA),
        ).rejects.toThrow(/Oso ForbiddenError/);
      });
    });

    describe('#authorizedActions', function () {
      it('should return all explicit authorized actions', async () => {
        const {users, orgs} = td;
        const actions = await enforcer.authorizedActions(users.jerry, orgs.tesla);
        expect([...actions].sort()).toEqual(OrgPolicy.rolePermissions![OrgRoles.member].sort());
      });

      it('should return all implicit authorized actions', async () => {
        const {users, repos} = td;
        const actions = await enforcer.authorizedActions(users.musk, repos.repoTeslaA);
        expect([...actions].sort()).toEqual(Object.values(RepoPermissions).sort());
      });

      it('should return all authorized actions for custom role', async () => {
        const {users, orgs} = td;
        const actions = await enforcer.authorizedActions(users.tom, orgs.tesla);
        expect([...actions].sort()).toEqual(OrgManagerPermissions.sort());
      });
    });

    describe('#authorizedQuery', function () {
      it('should return authorizedQuery', async () => {
        const roleMappingService = await app.get(AclBindings.ROLE_MAPPING_SERVICE);
        const orgRepo = await app.getRepository(OrgRepository);
        const {users, orgs} = td;

        await roleMappingService.add(users.musk, OrgRoles.member, orgs.google);
        await roleMappingService.add(users.musk, OrgRoles.member, orgs.twitter);

        // evaluate authorized query for orgs that "musk" can "read"
        let query = await enforcer.authorizedQuery(users.musk, OrgPermissions.read, Org);
        expect(query).toBeDefined();
        let results = await orgRepo.find({where: query.where});
        expect(results).toHaveLength(3);

        // evaluate authorized query for orgs that "musk" can "create_repos"
        query = await enforcer.authorizedQuery(users.musk, OrgPermissions.create_repos, Org);
        expect(query).toBeDefined();
        results = await orgRepo.find({where: query.where});
        expect(results).toHaveLength(1);
      });
    });

    describe('#authorizedResources', function () {
      it('should return authorizedResources', async () => {
        const roleMappingService = await app.get(AclBindings.ROLE_MAPPING_SERVICE);
        const {users, orgs} = td;

        await roleMappingService.add(users.musk, OrgRoles.member, orgs.google);
        await roleMappingService.add(users.musk, OrgRoles.member, orgs.twitter);

        // evaluate authorized query for orgs that "musk" can "read"
        let results = await enforcer.authorizedResources(users.musk, OrgPermissions.read, Org);
        expect(results).toHaveLength(3);

        // evaluate authorized query for orgs that "musk" can "create_repos"
        results = await enforcer.authorizedResources(users.musk, OrgPermissions.create_repos, Org);
        expect(results).toHaveLength(1);
      });
    });
  });
}
