import {
  IssueRepository,
  OrgPermissions,
  OrgRepository,
  OrgRoles,
  RepoRepository,
  RepoRoles,
  UserRepository,
} from './components/gitclub';
import {ApplicationWithRepositories} from '@loopback/repository';
import {RoleMappingRepository, RolePermissionRepository, RoleRepository} from '../../repositories';
import {toPrincipalPolymorphic, toResourcePolymorphic} from '../../helpers';
import {TestDomain} from './constants';

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

  const musk = await userRepo.create({name: 'Musk'});
  const tom = await userRepo.create({name: 'Tom'});
  const jerry = await userRepo.create({name: 'Jerry'});
  const ava = await userRepo.create({name: 'Ava'});
  const james = await userRepo.create({name: 'James'});

  const users = {musk, tom, jerry, ava, james};

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
  const roleRepo = await app.getRepository(RoleRepository);
  const roleMappingRepo = await app.getRepository(RoleMappingRepository);
  const rolePermissionRepo = await app.getRepository(RolePermissionRepository);

  const {orgs, users} = data;

  // * TESLA
  // --------------------------------------------------------------------------------
  // create 'manager' role
  const managerTelsa = await roleRepo.create({
    domain: TestDomain,
    name: 'manager',
    ...toResourcePolymorphic(orgs.tesla),
  });

  await rolePermissionRepo.createAll(
    OrgManagerPermissions.map(p => ({
      domain: TestDomain,
      roleId: managerTelsa.id,
      permission: p,
    })),
  );

  // assign 'owner' on org 'tesla' to 'musk'
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: OrgRoles.owner,
    ...toPrincipalPolymorphic(users.musk),
    ...toResourcePolymorphic(orgs.tesla),
  });

  // assign 'manager' on org 'tesla' to 'tom'
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: managerTelsa.id,
    ...toPrincipalPolymorphic(users.tom),
    ...toResourcePolymorphic(orgs.tesla),
  });

  // assign 'member' on org 'tesla' to 'jerry'
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: OrgRoles.member,
    ...toPrincipalPolymorphic(users.jerry),
    ...toResourcePolymorphic(orgs.tesla),
  });

  // assign roles on repo
  // --------------------------------------------------------------------------------

  // assign 'admin' on repo 'repoTeslaA' to 'tom'
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: RepoRoles.admin,
    ...toPrincipalPolymorphic(users.tom),
  });

  // assign 'maintainer' on repo 'repoTeslaA' to 'jerry'
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: RepoRoles.maintainer,
    ...toPrincipalPolymorphic(users.jerry),
  });

  // assign 'reader' on repo 'repoTeslaA' to 'ava' (out of tesla)
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: RepoRoles.reader,
    ...toPrincipalPolymorphic(users.ava),
  });

  // * Google
  // --------------------------------------------------------------------------------
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: OrgRoles.owner,
    ...toPrincipalPolymorphic(users.james),
    ...toResourcePolymorphic(orgs.google),
  });

  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: OrgRoles.member,
    ...toPrincipalPolymorphic(users.ava),
    ...toResourcePolymorphic(orgs.google),
  });
}
