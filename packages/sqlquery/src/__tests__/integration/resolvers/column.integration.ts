/* eslint-disable @typescript-eslint/no-explicit-any */
import {Knex} from "knex";
import {Entity, model} from "@loopback/repository";
import {Filter} from "@loopback/filter";
import {DB, givenColumnResolvers, givenDb, mockPg} from "../../support";
import {ColumnsResolver} from "../../../resolvers";
import {User} from "../../fixtures/models/user";
import {createKnex} from "../../../knex";

mockPg();

@model()
class EmptyEntity extends Entity{}

describe('resolver/columns integration tests', () => {
  let db: DB;
  let resolvers: Record<string, ColumnsResolver<any>>;

  beforeAll(() => {
    db = givenDb({connector: 'postgresql'});
    resolvers = givenColumnResolvers(db.ds);
  });

  it('should return undefined if entity has no properties', () => {
    testBuildColumns(
      new ColumnsResolver(EmptyEntity, db.ds),
      undefined,
      undefined,
    )

    testBuildColumns(
      new ColumnsResolver(EmptyEntity, db.ds),
      [],
      undefined,
    )

    testBuildColumns(
      new ColumnsResolver(EmptyEntity, db.ds),
      ['id'],
      undefined,
    )
  });

  describe('array fields', function () {
    it('should build columns', function () {
      testBuildColumns(
        resolvers[User.name],
        ['id'],
        ['"id"'],
      )
    });

    it('should build columns with all properties if fields is empty', function () {
      testBuildColumns(
        resolvers[User.name],
        [],
        ['"id"', '"email"', '"address"'],
      )
    });

    it('should return empty array if fields not match any property', function () {
      testBuildColumns(
        resolvers[User.name],
        ['__not_exist__'],
        [],
      )
    });

    it('should build columns ignoring fields not in properties', function () {
      testBuildColumns(
        resolvers[User.name],
        ['id', '__not_exist__'],
        ['"id"'],
      )
    });
  });

  describe('object fields', function () {
    it('should build columns with includes', function () {
      testBuildColumns(
        resolvers[User.name],
        {id: true},
        ['"id"'],
      )
    });

    it('should build columns with includes and excludes', function () {
      testBuildColumns(
        resolvers[User.name],
        {id: true, email: false},
        ['"id"'],
      )
    });

    it('should build columns with excludes', function () {
      testBuildColumns(
        resolvers[User.name],
        {email: false},
        ['"id"', '"address"'],
      )
    });

    it('should build columns ignoring fields not in properties', function () {
      testBuildColumns(
        resolvers[User.name],
        {'id': true, '__not_exist__': true},
        ['"id"'],
      )
    });
  });

  describe('resolve', function () {
    let knex: Knex

    beforeAll(() => {
      knex = createKnex(db.ds);
    });

    it('should resolve query with columns and with table prefix', function () {
      testColumnsResolve(
        knex,
        resolvers[User.name],
        {fields: ['id', 'address']},
        'select "user"."id", "user"."address" from "public"."user"',
      )
    });
  });
})

function testBuildColumns(
  resolver: ColumnsResolver<any>,
  fields: string[] | Record<string, boolean | undefined> | undefined,
  expectedColumns: string[] | undefined,
) {
  const columns = resolver.buildColumnNames(fields);
  expect(columns).toEqual(expectedColumns);
}

function testColumnsResolve(
  knex: Knex,
  resolver: ColumnsResolver<any>,
  filter: Filter,
  expectedSql: string,
) {
  const qb = knex(resolver.tableEscaped()).queryContext({skipEscape: true});
  resolver.resolve(qb, filter);
  const s = qb.toSQL();
  expect(s.sql).toEqual(expectedSql);
}
