/* eslint-disable @typescript-eslint/no-explicit-any */
import {Filter} from '@loopback/filter';
import {Knex} from 'knex';
import each from 'tily/object/each';
import {DeepPartial} from 'ts-essentials';
import {JoinResolver} from '../../../resolvers';
import {QuerySession} from '../../../session';
import {createKnex} from '../../../knex';
import {RelationConstraint} from '../../../relation';
import {DB, givenDb, givenJoinResolvers, mockPg} from '../../support';
import {Issue} from '../../fixtures/models/issue';
import {Foo} from '../../fixtures/models/foo';
import {Proj} from '../../fixtures/models/proj';
import {User} from '../../fixtures/models/user';
import {Org} from '../../fixtures/models/org';

mockPg();

describe('resolvers/join integration tests', () => {
  let db: DB;
  let resolvers: Record<string, JoinResolver<any>>;
  let knex: Knex;
  let session: QuerySession;

  beforeAll(() => {
    db = givenDb({connector: 'postgresql'});
    resolvers = givenJoinResolvers(db.ds);
    knex = createKnex(db.ds);
  });

  beforeEach(() => {
    session = new QuerySession();
  });

  it('should resolve empty query', () => {
    testJoin(
      knex,
      resolvers[Foo.name],
      session,
      {},

      'select * from "public"."foo"',
    );
  });

  it('should resolve query with belongsTo join', () => {
    testJoin(
      knex,
      resolvers[Issue.name],
      session,
      {
        where: {
          'proj.name': 'loopback',
        },
      },
      'select * from "public"."issue" inner join "public"."proj" as "t_0_0_proj" on "issue"."projId" = "t_0_0_proj"."id"',
      {
        'proj.name': {
          prefix: 't_0_0_',
          model: 'Proj',
          property: {key: 'name'},
        },
      },
    );
  });

  it('should resolve query with hasOne join', () => {
    testJoin(
      knex,
      resolvers[User.name],
      session,
      {
        where: {
          'userInfo.info': 'loopback',
        },
      },
      'select * from "public"."user" inner join "public"."userinfo" as "t_0_0_userinfo" on "user"."id" = "t_0_0_userinfo"."userid"',
      {
        'userInfo.info': {
          prefix: 't_0_0_',
          model: 'UserInfo',
          property: {key: 'info'},
        },
      },
    );
  });

  it('should resolve query with hasMany join', () => {
    testJoin(
      knex,
      resolvers[Proj.name],
      session,
      {
        where: {
          'issues.title': 'loopback',
        },
      },
      'select * from "public"."proj" inner join "public"."issue" as "t_0_0_issue" on "proj"."id" = "t_0_0_issue"."projId"',
      {
        'issues.title': {
          prefix: 't_0_0_',
          model: 'Issue',
          property: {key: 'title'},
        },
      },
    );
  });

  it('should resolve query with hasMany through join', () => {
    testJoin(
      knex,
      resolvers[Org.name],
      session,
      {
        where: {
          'users.email': {
            ilike: '%@gmail.com',
          },
        },
      },
      'select * from "public"."org" inner join "public"."orguser" as "t_0_0_orguser" on "org"."id" = "t_0_0_orguser"."orgid" inner join "public"."user" as "t_0_0_user" on "t_0_0_orguser"."userid" = "t_0_0_user"."id"',
      {
        'users.email': {
          prefix: 't_0_0_',
          model: 'User',
          property: {key: 'email'},
        },
      },
    );
  });

  it('should resolve query with hasMany through join and multiple conditions', () => {
    testJoin(
      knex,
      resolvers[Org.name],
      session,
      {
        where: {
          or: [
            {
              'users.email': {
                ilike: '%@gmail.com',
              },
            },
            {
              'users.userInfo.info': {
                ilike: '%abc%',
              },
            },
          ],
        },
      },
      'select * from "public"."org" inner join "public"."orguser" as "t_0_0_orguser" on "org"."id" = "t_0_0_orguser"."orgid" inner join "public"."user" as "t_0_0_user" on "t_0_0_orguser"."userid" = "t_0_0_user"."id" inner join "public"."userinfo" as "t_2_1_userinfo" on "t_0_0_user"."id" = "t_2_1_userinfo"."userid"',
      {
        'users.email': {
          prefix: 't_0_0_',
          model: 'User',
          property: {key: 'email'},
        },
        'users.userInfo.info': {
          prefix: 't_2_1_',
          model: 'UserInfo',
          property: {key: 'info'},
        },
      },
    );
  });

  it('should resolve query with deep hasMany join', () => {
    testJoin(
      knex,
      resolvers[Org.name],
      session,
      {
        where: {
          'projs.issues.title': 'loopback',
        },
      },
      'select * from "public"."org" inner join "public"."proj" as "t_0_0_proj" on "org"."id" = "t_0_0_proj"."org_id" inner join "public"."issue" as "t_1_1_issue" on "t_0_0_proj"."id" = "t_1_1_issue"."projId"',
      {
        'projs.issues.title': {
          prefix: 't_1_1_',
          model: 'Issue',
          property: {key: 'title'},
        },
      },
    );
  });

  it('should resolve query with `or` operator', () => {
    testJoin(
      knex,
      resolvers[Org.name],
      session,
      {
        where: {
          and: [
            {
              'projs.issues.title': 'a',
            },
            {
              'projs.issues.title': 'b',
            },
          ],
        },
      },
      'select * from "public"."org" inner join "public"."proj" as "t_0_0_proj" on "org"."id" = "t_0_0_proj"."org_id" inner join "public"."issue" as "t_1_1_issue" on "t_0_0_proj"."id" = "t_1_1_issue"."projId"',
      {
        'projs.issues.title': {
          prefix: 't_1_1_',
          model: 'Issue',
          property: {key: 'title'},
        },
      },
    );
  });

  it('should resolve query with `and` operator', () => {
    testJoin(
      knex,
      resolvers[Org.name],
      session,
      {
        where: {
          and: [
            {
              'projs.issues.closed': false,
            },
            {
              'projs.issues.title': 'a',
            },
          ],
        },
      },
      'select * from "public"."org" inner join "public"."proj" as "t_0_0_proj" on "org"."id" = "t_0_0_proj"."org_id" inner join "public"."issue" as "t_1_1_issue" on "t_0_0_proj"."id" = "t_1_1_issue"."projId"',
      {
        'projs.issues.closed': {
          prefix: 't_1_1_',
          model: 'Issue',
          property: {key: 'closed'},
        },
        'projs.issues.title': {
          prefix: 't_1_1_',
          model: 'Issue',
          property: {key: 'title'},
        },
      },
    );
  });

  it('should resolve query with join and deep json', () => {
    testJoin(
      knex,
      resolvers[Org.name],
      session,
      {
        where: {
          'users.address.city': 'HK',
        },
      },
      'select * from "public"."org" inner join "public"."orguser" as "t_0_0_orguser" on "org"."id" = "t_0_0_orguser"."orgid" inner join "public"."user" as "t_0_0_user" on "t_0_0_orguser"."userid" = "t_0_0_user"."id"',
      {
        'users.address.city': {
          prefix: 't_0_0_',
          model: 'User',
          property: {key: 'address.city'},
        },
      },
    );
  });
});

function testJoin(
  knex: Knex,
  resolver: JoinResolver<any>,
  session: QuerySession,
  filter: Filter,
  expectedSql: string,
  expectedRelationWhere: Record<string, DeepPartial<RelationConstraint>> = {},
  expectedRelationOrder: Record<string, DeepPartial<RelationConstraint>> = {},
) {
  const qb = knex(resolver.tableEscaped()).queryContext({skipEscape: true});
  resolver.resolve(qb, filter, session);
  const s = qb.toSQL();
  expect(s.sql).toEqual(expectedSql);

  expect(Object.keys(session.relationWhere).length).toEqual(Object.keys(expectedRelationWhere).length);
  expect(Object.keys(session.relationOrder).length).toEqual(Object.keys(expectedRelationOrder).length);

  each((value, key) => {
    expect(session.relationWhere[key]).toMatchObject(value);
  }, expectedRelationWhere);

  each((value, key) => {
    expect(session.relationOrder[key]).toMatchObject(value);
  }, expectedRelationOrder);
}
