import {Where} from '@loopback/repository';
import {OsoApp} from '../fixtures/application';
import {Enforcer} from '../fixtures/enforcer';
import {Bar} from '../fixtures/models/bar.model';
import {Foo} from '../fixtures/models/foo.model';
import {Issue} from '../fixtures/models/issue.model';
import {Log} from '../fixtures/models/log.model';
import {Num} from '../fixtures/models/num.model';
import {Repo} from '../fixtures/models/repo.model';
import {seed, TestData} from '../fixtures/seed';
import {checkAuthz, fixturesPath, givenAppAndEnforcer} from '../support';

describe('JugglerAdapter', function () {
  describe('Data filtering parity tests', function () {
    let app: OsoApp;
    let td: TestData;
    let enforcer: Enforcer;

    beforeAll(async () => {
      ({app, enforcer} = await givenAppAndEnforcer());
      td = await seed(app);
    });

    afterAll(async () => {
      if (app) await app.stop();
      (app as unknown) = undefined;
    });

    beforeEach(async () => {
      enforcer.clearRules();
    });

    it('test_authorize_with_a_single_model', async function () {
      const {foos} = td;
      await enforcer.loadStr('allow(_, _, _: Foo{id: "something"});');
      await checkAuthz(enforcer, 'gwen', 'get', Foo, [foos.something]);
      enforcer.clearRules();
      await enforcer.loadStr(`
      allow(_, _, _: Foo{id: "something"});
      allow(_, _, _: Foo{id: "another"});
    `);
      await checkAuthz(enforcer, 'gwen', 'get', Foo, [foos.something, foos.another]);
    });

    it('test_authorize_scalar_attribute_eq', async () => {
      const {allBars, allFoos} = td;
      await enforcer.loadStr(`
      allow(_: Bar, "read", _: Foo{isFooey: true});
      allow(bar: Bar, "read", _: Foo{bar: bar});
    `);
      for (const bar of allBars) {
        const expected = allFoos.filter(foo => foo.isFooey || foo.barId === bar.id);
        await checkAuthz(enforcer, bar, 'read', Foo, expected);
      }
    });

    it('test_authorize_scalar_attribute_condition', async () => {
      const {allBars, allFoos, findBarByFoo} = td;
      await enforcer.loadStr(`
      allow(bar: Bar{isCool: true}, "read", _: Foo{bar: bar});
      allow(_: Bar, "read", _: Foo{bar: b, isFooey: true}) if b.isCool;
      allow(_: Bar{isStillCool: true}, "read", foo: Foo) if
        foo.bar.isCool = false;
    `);
      for (const bar of allBars) {
        const expected = allFoos.filter(foo => {
          // typeORM fails to perform the basic functions of an ORM :|
          const myBar = findBarByFoo(foo)!;
          return (
            (myBar.isCool && myBar.id === bar.id) || (myBar.isCool && foo.isFooey) || (!myBar.isCool && bar.isStillCool)
          );
        });
        await checkAuthz(enforcer, bar, 'read', Foo, expected);
      }
    });

    it('test_nested_relationship_many_single', async () => {
      const {allLogs, findBarByFoo, findFooByLog} = td;
      await enforcer.loadStr(`
      allow(log: Log, "read", bar: Bar) if log.foo in bar.foos;
    `);
      for (const log of allLogs) {
        await checkAuthz(enforcer, log, 'read', Bar, [findBarByFoo(findFooByLog(log)!)!]);
      }
    });

    it('test_nested_relationships_many_many', async () => {
      const {allLogs, findBarByFoo, findFooByLog} = td;
      await enforcer.loadStr(`
      allow(log: Log, "read", bar: Bar) if
        foo in bar.foos and log in foo.logs;
    `);
      for (const log of allLogs) {
        await checkAuthz(enforcer, log, 'read', Bar, [findBarByFoo(findFooByLog(log)!)!]);
      }
    });

    it('test_nested_relationship_many_many_constrained', async () => {
      const {allLogs, allBars, findFoosByBar} = td;
      await enforcer.loadStr(`
      allow(log: Log{data: "steve"}, "read", bar: Bar) if
        foo in bar.foos and log in foo.logs;
    `);
      for (const log of allLogs) {
        const expected = allBars.filter(bar => {
          if (log.data !== 'steve') return false;
          for (const foo of findFoosByBar(bar)) if (foo.id === log.fooId) return true;
          return false;
        });
        await checkAuthz(enforcer, log, 'read', Bar, expected);
      }
    });

    it('test_partial_in_collection', async () => {
      const {allBars, findFoosByBar} = td;
      await enforcer.loadStr(`
      allow(bar, "read", foo: Foo) if foo in bar.foos;
    `);
      for (const bar of allBars) {
        await checkAuthz(enforcer, bar, 'read', Foo, findFoosByBar(bar));
      }
    });

    test('test_partial_isa_with_path', async () => {
      const {bars, findFoosByBar} = td;
      await enforcer.loadStr(`
      allow(_, _, foo: Foo) if check(foo.bar);
      check(bar: Bar) if bar.id = "goodbye";
      check(foo: Foo) if foo.bar.id = "hello";
    `);
      await checkAuthz(enforcer, 'gwen', 'read', Foo, findFoosByBar(bars.bye));
    });

    test('test_no_relationships', async () => {
      const {allFoos} = td;
      await enforcer.loadStr(`
      allow(_, _, foo: Foo) if foo.isFooey;
    `);
      const expected = allFoos.filter((foo: Foo) => foo.isFooey);
      await checkAuthz(enforcer, 'gwen', 'get', Foo, expected);
    });

    test('test_neq', async () => {
      const {allBars, allFoos} = td;
      await enforcer.loadStr(`
      allow(_, action, foo: Foo) if foo.bar.id != action;
    `);
      for (const bar of allBars) {
        const expected = allFoos.filter(foo => foo.barId !== bar.id);
        await checkAuthz(enforcer, 'gwen', bar.id, Foo, expected);
      }
    });

    test('test_relationship', async () => {
      const {allFoos, findBarByFoo} = td;
      await enforcer.loadStr(`
      allow(_, "get", foo: Foo) if
        foo.bar = bar and
          bar.isCool and
          foo.isFooey;
    `);

      const expected = allFoos.filter((foo: Foo) => findBarByFoo(foo)!.isCool && foo.isFooey);
      await checkAuthz(enforcer, 'steve', 'get', Foo, expected);
    });

    // Joins to the same table are not yet supported in new data filtering
    xtest('test_duplex_relationship', async () => {
      const {allFoos} = td;
      await enforcer.loadStr(`
      allow(_, _, foo: Foo) if foo in foo.bar.foos;
    `);
      await checkAuthz(enforcer, 'gwen', 'get', Foo, allFoos);
    });

    test('test_scalar_in_list', async () => {
      const {allFoos} = td;
      await enforcer.loadStr(`
      allow(_, _, _: Foo{bar: bar}) if bar.isCool in [true, false];
    `);
      await checkAuthz(enforcer, 'gwen', 'get', Foo, allFoos);
    });

    test('test_var_in_vars', async () => {
      const {allFoos, findLogsByFoo} = td;
      await enforcer.loadStr(`
      allow(_, _, foo: Foo) if
        log in foo.logs and
        log.data = "goodbye";
    `);
      const expected = allFoos.filter((foo: Foo) => {
        for (const log of findLogsByFoo(foo)) if (log.data === 'goodbye') return true;
        return false;
      });
      await checkAuthz(enforcer, 'gwen', 'get', Foo, expected);
    });

    test('test_specializers', async () => {
      const {allLogs, findFooByLog} = td;
      await enforcer.loadStr(`
      allow(foo: Foo,             "NoneNone", log) if foo = log.foo;
      allow(foo,                  "NoneCls",  log: Log) if foo = log.foo;
      allow(foo,                  "NoneDict", _: {foo:foo});
      allow(foo,                  "NonePtn",  _: Log{foo: foo});
      allow(foo: Foo,             "ClsNone",  log) if log in foo.logs;
      allow(foo: Foo,             "ClsCls",   log: Log) if foo = log.foo;
      allow(foo: Foo,             "ClsDict",  _: {foo: foo});
      allow(foo: Foo,             "ClsPtn",   _: Log{foo: foo});
      allow(_: {logs: logs},      "DictNone", log) if log in logs;
      allow(_: {logs: logs},      "DictCls",  log: Log) if log in logs;
      allow(foo: {logs: logs},    "DictDict", log: {foo: foo}) if log in logs;
      allow(foo: {logs: logs},    "DictPtn",  log: Log{foo: foo}) if log in logs;
      allow(_: Foo{logs: logs},   "PtnNone",  log) if log in logs;
      allow(_: Foo{logs: logs},   "PtnCls",   log: Log) if log in logs;
      allow(foo: Foo{logs: logs}, "PtnDict",  log: {foo: foo}) if log in logs;
      allow(foo: Foo{logs: logs}, "PtnPtn",   log: Log{foo: foo}) if log in logs;
    `);
      const parts = ['None', 'Cls', 'Dict', 'Ptn'];
      for (const a of parts)
        for (const b of parts)
          for (const log of allLogs) {
            await checkAuthz(enforcer, findFooByLog(log), a + b, Log, [log]);
          }
    });

    test('test_empty_constraints_in', async () => {
      const {allFoos, findLogsByFoo} = td;
      await enforcer.loadStr(`
      allow(_, "read", foo: Foo) if _ in foo.logs;
    `);
      const expected = allFoos.filter((foo: Foo) => findLogsByFoo(foo).length);
      //    console.log(expected);
      await checkAuthz(enforcer, 'gwen', 'read', Foo, expected);
      // not sure why this one is failing ...
    });

    test('test_in_with_constraints_but_no_matching_object', async () => {
      await enforcer.loadStr(`
      allow(_, "read", foo: Foo) if
        log in foo.logs and
        log.data = "nope";
    `);
      await checkAuthz(enforcer, 'gwen', 'read', Foo, []);
    });

    test('test_unify_ins', async () => {
      const {allBars, allFoos} = td;
      await enforcer.loadStr(`
      allow(_, _, _: Bar{foos: foos}) if
        foo in foos and
        goo in foos and
        foo = goo;
    `);
      const expected = allBars.filter((bar: Bar) => {
        for (const foo of allFoos) {
          if (foo.barId === bar.id) return true;
        }
        return false;
      });

      await checkAuthz(enforcer, 'gwen', 'read', Bar, expected);
    });

    test('test_unify_ins_field_eq', async () => {
      const {allBars, findFoosByBar} = td;
      await enforcer.loadStr(`
      allow(_, _, _: Bar{foos:foos}) if
        foo in foos and
        goo in foos and
        foo.id = goo.id;
    `);
      const expected = allBars.filter(bar => findFoosByBar(bar).length);
      await checkAuthz(enforcer, 'gwen', 'get', Bar, expected);
    });

    test('test_var_in_value', async () => {
      const {logs} = td;
      await enforcer.loadStr(`
      allow(_, _, log: Log) if log.data in ["goodbye", "world"];
    `);

      await checkAuthz(enforcer, 'gwen', 'get', Log, [logs.a, logs.another]);
    });

    test('test_field_eq', async () => {
      const {allBars} = td;
      await enforcer.loadStr(`
      allow(_, _, _: Bar{isCool: cool, isStillCool: cool});
    `);
      const expected = allBars.filter(bar => bar.isCool === bar.isStillCool);
      await checkAuthz(enforcer, 'gwen', 'get', Bar, expected);
    });

    test('test_field_neq', async () => {
      const {allBars} = td;
      await enforcer.loadStr(`
      allow(_, _, bar: Bar) if bar.isCool != bar.isStillCool;
    `);
      const expected = allBars.filter(bar => bar.isCool !== bar.isStillCool);
      await checkAuthz(enforcer, 'gwen', 'get', Bar, expected);
    });

    test('test_const_in_coll', async () => {
      const magic = 1;
      const {allFoos, findNumsByFoo} = td;
      enforcer.registerConstant(magic, 'magic');
      await enforcer.loadStr(`
      allow(_, _, foo: Foo) if n in foo.numbers and n.number = magic;
    `);

      const expected = allFoos.filter(foo => findNumsByFoo(foo).filter(num => num.number === 1).length);
      await checkAuthz(enforcer, 'gwen', 'get', Foo, expected);
    });

    test('test_redundant_in_on_same_field', async () => {
      const {allFoos, findNumsByFoo} = td;
      await enforcer.loadStr(`
      allow(_, _, _: Foo{numbers:ns}) if
        m in ns and n in ns and
        n.number = 2 and m.number = 1;
    `);

      const expected = allFoos.filter((foo: Foo) =>
        findNumsByFoo(foo).some((num: Num) => [1, 2].every(n => n === num.number)),
      );

      await checkAuthz(enforcer, 'gwen', 'get', Foo, expected);
    });

    test('test_ground_object_in_collection', async () => {
      const {allFoos, findNumsByFoo} = td;
      await enforcer.loadStr(`
      allow(_, _, _: Foo{numbers:ns}) if
        n in ns and m in ns and
        n.number = 1 and m.number = 2;
    `);

      const expected = allFoos.filter((foo: Foo) =>
        findNumsByFoo(foo).some((num: Num) => [1, 2].every(n => n === num.number)),
      );

      await checkAuthz(enforcer, 'gwen', 'get', Foo, expected);
    });

    test('test_param_field', async () => {
      const {allLogs} = td;
      await enforcer.loadStr(`
      allow(data, id, _: Log{data: data, id: id});
    `);
      for (const log of allLogs) await checkAuthz(enforcer, log.data, log.id, Log, [log]);
    });

    test('test_field_cmp_rel_field', async () => {
      const {allFoos, findBarByFoo} = td;
      await enforcer.loadStr(`
      allow(_, _, foo: Foo) if foo.bar.isCool = foo.isFooey;
    `);

      const expected = allFoos.filter(foo => findBarByFoo(foo)!.isCool === foo.isFooey);
      await checkAuthz(enforcer, 'gwen', 'get', Foo, expected);
    });

    test('test_field_cmp_rel_rel_field', async () => {
      const {allLogs, findFooByLog, findBarByFoo} = td;
      await enforcer.loadStr(`
      allow(_, _, log: Log) if log.data = log.foo.bar.id;
    `);
      const expected = allLogs.filter(log => findBarByFoo(findFooByLog(log)!)!.id === log.data);
      await checkAuthz(enforcer, 'gwen', 'get', Log, expected);
    });

    test('test_parent_child_cases', async () => {
      const {allLogs, findFooByLog} = td;
      await enforcer.loadStr(`
      allow(_: Log{foo: foo},   0, foo: Foo);
      allow(log: Log,           1, _: Foo{logs: logs}) if log in logs;
      allow(log: Log{foo: foo}, 2, foo: Foo{logs: logs}) if log in logs;
    `);
      for (const i of [0, 1, 2])
        for (const log of allLogs) {
          await checkAuthz(enforcer, log, i, Foo, [findFooByLog(log)!]);
        }
    });
  });

  describe('Data filtering using juggler/sqlite', function () {
    let app: OsoApp;
    let td: TestData;
    let enforcer: Enforcer;

    beforeAll(async () => {
      ({app, enforcer} = await givenAppAndEnforcer());
      td = await seed(app);
    });

    afterAll(async () => {
      if (app) await app.stop();
      (app as unknown) = undefined;
    });

    beforeEach(async () => {
      enforcer.clearRules();
    });

    // multiple joins to the same table are not yet supported in the new data filtering
    xtest('relations and operators', async () => {
      const {foos} = td;

      await enforcer.loadStr(`
      allow("steve", "get", resource: Foo) if
          resource.bar = bar and
          bar.isCool = true and
          resource.isFooey = true;
      allow("steve", "patch", foo: Foo) if
        foo in foo.bar.foos;
      allow(num: Integer, "count", foo: Foo) if
        rec in foo.numbers and
        rec.number = num;`);

      await checkAuthz(enforcer, 'steve', 'get', Foo, [foos.another, foos.third, foos.fourth]);
      await checkAuthz(enforcer, 'steve', 'patch', Foo, [foos.something, foos.another, foos.third, foos.fourth]);

      await checkAuthz(enforcer, 0, 'count', Foo, [foos.something, foos.another, foos.third]);
      await checkAuthz(enforcer, 1, 'count', Foo, [foos.something, foos.another]);
      await checkAuthz(enforcer, 2, 'count', Foo, [foos.something]);
    });

    test('an empty result', async () => {
      await enforcer.loadStr('allow("gwen", "put", _: Foo);');
      expect(await enforcer.authorizedResources('gwen', 'delete', Foo)).toEqual([]);
    });

    test('not equals', async () => {
      const {bars} = td;
      await enforcer.loadStr(`
      allow("gwen", "get", bar: Bar) if
        bar.isCool != bar.isStillCool;`);
      await checkAuthz(enforcer, 'gwen', 'get', Bar, [bars.bye]);
    });

    test('returning, modifying and executing a query', async () => {
      const {foos} = td;
      await enforcer.loadStr(`
      allow("gwen", "put", foo: Foo) if
        rec in foo.numbers and
        rec.number in [1, 2];`);

      const filter = await enforcer.authorizedQuery('gwen', 'put', Foo);

      expect(filter.model).toBe('Foo');

      const repo = await enforcer.repositoryFactory.getRepository(filter.model);

      let result = await repo.find({where: filter.where as Where});
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([foos.something, foos.another]));

      result = await repo.find({where: {and: [filter.where as Where, {id: 'something'}]}});
      expect(result).toHaveLength(1);
      expect(result).toEqual(expect.arrayContaining([foos.something]));
    });

    test('a roles policy', async () => {
      const {foos, bars} = td;
      await enforcer.loadStr(`
          allow(actor, action, resource) if
            has_permission(actor, action, resource);

          has_role("steve", "owner", bar: Bar) if
            bar.id = "hello";

          actor String {}

          resource Bar {
            roles = [ "owner" ];
            permissions = [ "get" ];

            "get" if "owner";
          }

          resource Foo {
            roles = [ "reader" ];
            permissions = [ "read" ];
            relations = { parent: Bar };

            "read" if "reader";

            "reader" if "owner" on "parent";
          }

          has_relation(bar: Bar, "parent", foo: Foo) if
            bar = foo.bar;
          `);
      await checkAuthz(enforcer, 'steve', 'get', Bar, [bars.hello]);
      await checkAuthz(enforcer, 'steve', 'read', Foo, [foos.something, foos.another, foos.third]);
    });

    test('a gitclub-like policy', async () => {
      const {repos, issues, users} = td;
      await enforcer.loadFiles([fixturesPath('gitclub.polar')]);

      await checkAuthz(enforcer, users.steve, 'create_issues', Repo, [repos.ios]);
      await checkAuthz(enforcer, users.steve, 'read', Issue, [issues.lag]);
      await checkAuthz(enforcer, users.gwen, 'read', Repo, [repos.app, repos.pol]);
      await checkAuthz(enforcer, users.gwen, 'read', Issue, [issues.bug]);
      await checkAuthz(enforcer, users.gwen, 'create_issues', Repo, []);
      await checkAuthz(enforcer, users.leina, 'create_issues', Repo, [repos.pol]);
      await checkAuthz(enforcer, users.gabe, 'create_issues', Repo, []);

      const filter = await enforcer.authorizedQuery(users.gwen, 'read', Issue);
      const repo = await enforcer.repositoryFactory.getRepository(filter.model);
      const result = await repo.find({where: filter.where as Where});
      expect(result).toHaveLength(1);
      expect(result).toEqual(expect.arrayContaining([issues.bug]));
    }, 60000);

    test('should return authorized query for parent role', async () => {
      const {repos, users} = td;
      await enforcer.loadFiles([fixturesPath('gitclub.polar')]);
      const filter = await enforcer.authorizedQuery(users.leina, 'read', Repo);
      const repo = await enforcer.repositoryFactory.getRepository(filter.model);
      const result = await repo.find({where: filter.where as Where});
      expect(result).toHaveLength(1);
      expect(result).toEqual(expect.arrayContaining([repos.pol]));
    });
  });
});
