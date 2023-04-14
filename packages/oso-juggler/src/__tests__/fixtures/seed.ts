import {ApplicationWithRepositories} from '@loopback/repository';
import {Awaited} from 'ts-essentials';

import {Bar} from './models/bar.model';
import {Foo} from './models/foo.model';
import {Log} from './models/log.model';
import {Num} from './models/num.model';
import {BarRepository} from './repositories/bar.repository';
import {FooRepository} from './repositories/foo.repository';
import {IssueRepository} from './repositories/issue.repository';
import {LogRepository} from './repositories/log.repository';
import {NumRepository} from './repositories/num.repository';
import {OrgRoleRepository} from './repositories/org-role.repository';
import {OrgRepository} from './repositories/org.repository';
import {RepoRoleRepository} from './repositories/repo-role.repository';
import {RepoRepository} from './repositories/repo.repository';
import {UserRepository} from './repositories/user.repository';

export type TestData = Awaited<ReturnType<typeof seed>>;

export async function seed(application: ApplicationWithRepositories) {
  const barRepo = await application.getRepository(BarRepository);
  const fooRepo = await application.getRepository(FooRepository);
  const logRepo = await application.getRepository(LogRepository);
  const numRepo = await application.getRepository(NumRepository);

  const orgRepo = await application.getRepository(OrgRepository);
  const repoRepo = await application.getRepository(RepoRepository);
  const issueRepo = await application.getRepository(IssueRepository);
  const userRepo = await application.getRepository(UserRepository);
  const orgRolesRepo = await application.getRepository(OrgRoleRepository);
  const repoRolesRepo = await application.getRepository(RepoRoleRepository);

  const bars = {
    hello: new Bar({id: 'hello', isCool: true, isStillCool: true}),
    bye: new Bar({id: 'goodbye', isCool: true, isStillCool: false}),
    hershey: new Bar({id: 'hershey', isCool: false, isStillCool: false}),
  };
  await barRepo.createAll(Object.values(bars));

  const foos = {
    something: new Foo({id: 'something', barId: bars.hello.id, isFooey: false}),
    another: new Foo({id: 'another', barId: bars.hello.id, isFooey: true}),
    third: new Foo({id: 'third', barId: bars.hello.id, isFooey: true}),
    fourth: new Foo({id: 'fourth', barId: bars.bye.id, isFooey: true}),
  };
  await fooRepo.createAll(Object.values(foos));

  const logs = {
    a: new Log({id: 'a', fooId: 'fourth', data: 'goodbye'}),
    another: new Log({id: 'b', fooId: 'another', data: 'world'}),
    third: new Log({id: 'c', fooId: 'third', data: 'steve'}),
  };
  await logRepo.createAll(Object.values(logs));

  const nums: Num[] = await Promise.all([
    ...[0, 1, 2].map(async i => numRepo.create({fooId: 'something', number: i})),
    ...[0, 1].map(async i => numRepo.create({fooId: 'another', number: i})),
    ...[0].map(async i => numRepo.create({fooId: 'third', number: i})),
  ]);

  const allBars = Object.values(bars);
  const allFoos = Object.values(foos);
  const allLogs = Object.values(logs);
  const allNums = nums;

  const [apple, osohq, tiktok] = await orgRepo.createAll([
    {
      name: 'apple',
      billing_address: 'cupertino,  CA',
      base_repo_role: 'reader',
    },
    {name: 'osohq', billing_address: 'new york, NY', base_repo_role: 'reader'},
    {name: 'tiktok', billing_address: 'beijing, CN', base_repo_role: 'reader'},
  ]);
  const orgs = {apple, osohq, tiktok};

  const [pol, ios, app] = await repoRepo.createAll([
    {name: 'pol', orgId: osohq.id},
    {name: 'ios', orgId: apple.id},
    {name: 'app', orgId: tiktok.id},
  ]);
  const repos = {pol, ios, app};

  const [bug, lag] = await issueRepo.createAll([
    {title: 'bug', repoId: pol.id},
    {title: 'lag', repoId: ios.id},
  ]);
  const issues = {bug, lag};

  const [steve, leina, gabe, gwen] = await userRepo.createAll([
    {email: 'steve@osohq.com'},
    {email: 'leina@osohq.com'},
    {email: 'gabe@osohq.com'},
    {email: 'gwen@osohq.com'},
  ]);
  const users = {steve, leina, gabe, gwen};

  await orgRolesRepo.createAll([
    {name: 'owner', orgId: osohq.id, userId: leina.id},
    {name: 'member', orgId: tiktok.id, userId: gabe.id},
  ]);

  await repoRolesRepo.createAll([
    {name: 'writer', repoId: ios.id, userId: steve.id},
    {name: 'reader', repoId: app.id, userId: gwen.id},
    {name: 'reader', repoId: pol.id, userId: gwen.id},
  ]);

  const findBarByFoo = (foo: Foo) => allBars.find(bar => bar.id === foo.barId);
  const findFoosByBar = (bar: Bar) => allFoos.filter(foo => foo.barId === bar.id);
  const findFooByLog = (log: Log) => allFoos.find(foo => foo.id === log.fooId);
  const findLogsByFoo = (foo: Foo) => allLogs.filter(log => log.fooId === foo.id);
  const findNumsByFoo = (foo: Foo) => allNums.filter(num => num.fooId === foo.id);
  const findFooByNum = (num: Num) => allFoos.find(foo => foo.id === num.fooId);

  return {
    allBars,
    allFoos,
    allLogs,
    allNums,
    bars,
    foos,
    logs,
    nums,
    orgs,
    repos,
    issues,
    users,
    findBarByFoo,
    findFoosByBar,
    findFooByLog,
    findLogsByFoo,
    findNumsByFoo,
    findFooByNum,
  } as const;
}
