import {Awaited} from 'ts-essentials';
import {Context} from '@loopback/context';
import {ContextHelper} from '../support';
import {OrgRepository} from '../repositories/org.repository';
import {RepoRepository} from '../repositories/repo.repository';
import {IssueRepository} from '../repositories/issue.repository';
import {UserRepository} from '../repositories/user.repository';
import {OrgRoleRepository} from '../repositories/org-role.repository';
import {RepoRoleRepository} from '../repositories/repo-role.repository';
import {BarRepository} from '../repositories/bar.repository';
import {FooRepository} from '../repositories/foo.repository';
import {LogRepository} from '../repositories/log.repository';
import {NumRepository} from '../repositories/num.repository';
import {Num} from '../models/num.model';
import {Foo} from '../models/foo.model';
import {Bar} from '../models/bar.model';
import {Log} from '../models/log.model';

export type Samples = Awaited<ReturnType<typeof seedSamples>>;

export async function seedSamples(context: Context) {
  const helper = new ContextHelper(context);

  const barRepo = await helper.repository(BarRepository);
  const fooRepo = await helper.repository(FooRepository);
  const logRepo = await helper.repository(LogRepository);
  const numRepo = await helper.repository(NumRepository);

  const orgRepo = await helper.repository(OrgRepository);
  const repoRepo = await helper.repository(RepoRepository);
  const issueRepo = await helper.repository(IssueRepository);
  const userRepo = await helper.repository(UserRepository);
  const orgRolesRepo = await helper.repository(OrgRoleRepository);
  const repoRolesRepo = await helper.repository(RepoRoleRepository);

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
