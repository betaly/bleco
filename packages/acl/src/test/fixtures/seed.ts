import {
  DefaultSite,
  IssueRepository,
  OrgPermissions,
  OrgRepository,
  OrgRoles,
  RepoRepository,
  RepoRoles,
  SiteRoles,
  UserRepository,
} from './components/gitclub';
import {ApplicationWithRepositories} from '@loopback/repository';
import {TestDomain} from './constants';
import {AclBindings} from '../../keys';

export const OrgManagerPermissions = Object.values(OrgPermissions).filter(p => p !== 'create_repos');

export type TestData = Awaited<ReturnType<typeof seedData>>;

export async function seed(app: ApplicationWithRepositories) {
  const data = await seedData(app);
  await seedRoles(app, data);
  return data;
}

export async function seedData(app: ApplicationWithRepositories) {
  const userRepo = await app.getRepository(UserRepository);
  const orgRepo = await app.getRepository(OrgRepository);
  const repoRepo = await app.getRepository(RepoRepository);
  const issueRepo = await app.getRepository(IssueRepository);

  const god = await userRepo.create({name: 'God'});

  const musk = await userRepo.create({name: 'Musk'});
  const tom = await userRepo.create({name: 'Tom'});
  const jerry = await userRepo.create({name: 'Jerry'});
  const ava = await userRepo.create({name: 'Ava'});
  const james = await userRepo.create({name: 'James'});

  const users = {god, musk, tom, jerry, ava, james};

  const tesla = await orgRepo.create({name: 'Tesla'});
  const google = await orgRepo.create({name: 'Google'});
  const twitter = await orgRepo.create({name: 'Twitter'});

  const orgs = {tesla, google, twitter};

  const repoTeslaA = await repoRepo.create({name: 'Tesla Repo A', orgId: tesla.id});
  const repoTeslaB = await repoRepo.create({name: 'Tesla Repo B', orgId: tesla.id});
  const repoTeslaC = await repoRepo.create({name: 'Tesla Repo C', orgId: tesla.id});

  const repoGoogleA = await repoRepo.create({name: 'Google Repo A', orgId: google.id});
  const repoGoogleB = await repoRepo.create({name: 'Google Repo B', orgId: google.id});
  const repoGoogleC = await repoRepo.create({name: 'Google Repo C', orgId: google.id});

  const repoTwitterA = await repoRepo.create({name: 'Twitter Repo A', orgId: twitter.id});
  const repoTwitterB = await repoRepo.create({name: 'Twitter Repo B', orgId: twitter.id});
  const repoTwitterC = await repoRepo.create({name: 'Twitter Repo C', orgId: twitter.id});

  const repos = {
    repoGoogleA,
    repoGoogleB,
    repoGoogleC,
    repoTeslaA,
    repoTeslaB,
    repoTeslaC,
    repoTwitterA,
    repoTwitterB,
    repoTwitterC,
  };

  const issueTeslaA1 = await issueRepo.create({title: 'Issue 1 - Tesla Repo A', repoId: repoTeslaA.id});
  const issueTeslaA2 = await issueRepo.create({title: 'Issue 2 - Tesla Repo A', repoId: repoTeslaA.id});

  const issues = {
    issueTeslaA1,
    issueTeslaA2,
  };

  return {users, orgs, repos, issues};
}

export async function seedRoles(app: ApplicationWithRepositories, data: TestData) {
  const rs = await app.get(AclBindings.ROLE_SERVICE);
  const rms = await app.get(AclBindings.ROLE_MAPPING_SERVICE);

  const {orgs, users, repos} = data;

  // Site roles
  await rms.addInDomain(users.god, SiteRoles.admin, DefaultSite, TestDomain);
  for (const u of Object.values(users)) {
    if (u === users.god) continue;
    await rms.addInDomain(u, SiteRoles.member, DefaultSite, TestDomain);
  }

  // Tesla
  const managerTelsa = await rs.addInDomain(
    {
      name: 'manager',
      resource: orgs.tesla,
      permissions: OrgManagerPermissions,
    },
    TestDomain,
  );

  await rms.addInDomain(users.musk, OrgRoles.owner, orgs.tesla, TestDomain);
  await rms.addInDomain(users.jerry, OrgRoles.member, orgs.tesla, TestDomain);
  await rms.addInDomain(users.tom, managerTelsa.id, orgs.tesla, TestDomain);

  await rms.addInDomain(users.tom, RepoRoles.admin, repos.repoTeslaA, TestDomain);
  await rms.addInDomain(users.jerry, RepoRoles.maintainer, repos.repoTeslaA, TestDomain);
  await rms.addInDomain(users.ava, RepoRoles.reader, repos.repoTeslaA, TestDomain);

  // Google
  await rms.addInDomain(users.james, OrgRoles.owner, orgs.google, TestDomain);
  await rms.addInDomain(users.ava, OrgRoles.member, orgs.google, TestDomain);
}
