import {Enforcer} from '../enforcer';
import {AclBindings} from '../keys';
import {
  DefaultSite,
  GitClubApplication,
  Org,
  OrgActions,
  OrgManagerActions,
  OrgPolicy,
  OrgRepository,
  OrgRoles,
  Repo,
  RepoActions,
  RepoRepository,
  SiteActions,
  TestData,
} from './fixtures';
import {givenApp} from './support';
import {AppInit} from './types';

export function testEnforcerBatch(init?: AppInit) {
  describe('Enforcer Batch', () => {
    let app: GitClubApplication;
    let td: TestData;
    let enforcer: Enforcer;

    beforeEach(async () => {
      ({app, td} = await givenApp(init));
      enforcer = await app.get(AclBindings.ACL);
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
        expect(await enforcer.isAllowed(users.musk, OrgActions.create_repos, orgs.tesla)).toBe(true);
        expect(await enforcer.isAllowed(users.jerry, OrgActions.create_repos, orgs.tesla)).toBe(false);
      });

      it('custom roles', async () => {
        const {users, orgs} = td;
        expect(await enforcer.isAllowed(users.tom, OrgActions.list_repos, orgs.tesla)).toBe(true);
        expect(await enforcer.isAllowed(users.tom, OrgActions.create_repos, orgs.tesla)).toBe(false);
      });

      it('parent roles', async () => {
        const {users, repos} = td;
        expect(await enforcer.isAllowed(users.musk, RepoActions.create_role_assignments, repos.repoTeslaA)).toBe(true);
        expect(await enforcer.isAllowed(users.jerry, RepoActions.create_role_assignments, repos.repoTeslaA)).toBe(
          false,
        );
      });

      it('static resource', async () => {
        const {users} = td;
        expect(await enforcer.isAllowed(users.god, SiteActions.manage, DefaultSite)).toBe(true);
        expect(await enforcer.isAllowed(users.ava, SiteActions.manage, DefaultSite)).toBe(false);
        expect(await enforcer.isAllowed(users.god, SiteActions.create_orgs, DefaultSite)).toBe(true);
        expect(await enforcer.isAllowed(users.ava, SiteActions.create_orgs, DefaultSite)).toBe(true);
      });
    });

    describe('#authorize', function () {
      it('builtin roles', async () => {
        const {users, orgs} = td;
        await enforcer.authorize(users.musk, OrgActions.create_repos, orgs.tesla);
        await expect(enforcer.authorize(users.jerry, OrgActions.create_repos, orgs.tesla)).rejects.toThrow(
          /Oso ForbiddenError/,
        );
      });

      it('custom roles', async () => {
        const {users, orgs} = td;
        await enforcer.authorize(users.tom, OrgActions.list_repos, orgs.tesla);
        await expect(enforcer.authorize(users.tom, OrgActions.create_repos, orgs.tesla)).rejects.toThrow(
          /Oso ForbiddenError/,
        );
      });

      it('parent roles', async () => {
        const {users, repos} = td;
        await enforcer.authorize(users.musk, RepoActions.create_role_assignments, repos.repoTeslaA);
        await expect(
          enforcer.authorize(users.jerry, RepoActions.create_role_assignments, repos.repoTeslaA),
        ).rejects.toThrow(/Oso ForbiddenError/);
      });
    });

    describe('#authorizedActions', function () {
      it('should return all explicit authorized actions', async () => {
        const {users, orgs} = td;
        const actions = await enforcer.authorizedActions(users.jerry, orgs.tesla);
        expect([...actions].sort()).toEqual(OrgPolicy.roleActions![OrgRoles.member].sort());
      });

      it('should return all implicit authorized actions', async () => {
        const {users, repos} = td;
        const actions = await enforcer.authorizedActions(users.musk, repos.repoTeslaA);
        expect([...actions].sort()).toEqual(Object.values(RepoActions).sort());
      });

      it('should return all authorized actions for custom role', async () => {
        const {users, orgs} = td;
        const actions = await enforcer.authorizedActions(users.tom, orgs.tesla);
        expect([...actions].sort()).toEqual(OrgManagerActions.sort());
      });
    });

    describe('#authorizedQuery', function () {
      it('should return authorizedQuery', async () => {
        const roleMappingService = await app.get(AclBindings.ROLE_MAPPING_SERVICE);
        const orgRepo = await app.getRepository(OrgRepository);
        const {users, orgs} = td;

        await roleMappingService.add(users.musk, OrgRoles.member, orgs.google);
        await roleMappingService.add(users.musk, OrgRoles.member, orgs.twitter);

        // evaluate authorized query for Org that "musk" can "read"
        let query = await enforcer.authorizedQuery(users.musk, OrgActions.read, Org);
        expect(query).toBeDefined();
        let results = await orgRepo.find({where: query.where});
        expect(results).toHaveLength(3);

        // evaluate authorized query for orgs that "musk" can "create_repos"
        query = await enforcer.authorizedQuery(users.musk, OrgActions.create_repos, Org);
        expect(query).toBeDefined();
        results = await orgRepo.find({where: query.where});
        expect(results).toHaveLength(1);
      });

      it('authorized with parent role', async () => {
        const repo = await app.getRepository(RepoRepository);
        const {users} = td;

        // evaluate authorized query for Repo that "musk" can "read"
        const query = await enforcer.authorizedQuery(users.musk, RepoActions.read, Repo);
        expect(query).toBeDefined();
        const results = await repo.find({where: query.where});
        expect(results).toHaveLength(3);
      });
    });

    describe('#authorizedResources', function () {
      it('should return authorizedResources', async () => {
        const roleMappingService = await app.get(AclBindings.ROLE_MAPPING_SERVICE);
        const {users, orgs} = td;

        await roleMappingService.add(users.musk, OrgRoles.member, orgs.google);
        await roleMappingService.add(users.musk, OrgRoles.member, orgs.twitter);

        // evaluate authorized query for orgs that "musk" can "read"
        let results = await enforcer.authorizedResources(users.musk, OrgActions.read, Org);
        expect(results).toHaveLength(3);

        // evaluate authorized query for orgs that "musk" can "create_repos"
        results = await enforcer.authorizedResources(users.musk, OrgActions.create_repos, Org);
        expect(results).toHaveLength(1);
      });
    });
  });
}
