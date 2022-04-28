/* eslint-disable */
import {Knex} from 'knex';
import {WhereResolver} from '../../../../../drivers/sql/resolvers';
import {DB, filterSpecs, givenDb, givenWhereResolvers, mockPg} from '../../../../support';
import {createKnex} from '../../../../../drivers/sql/knex';
import {WhereSpec} from '../../../../types';
import ComplexSpecs from '../../../../data/where-complex';
import BasicSpecs from '../../../../data/where-basic';

mockPg();

describe('resolvers/where', () => {
  let db: DB;
  let resolvers: Record<string, WhereResolver<any>>;
  let knex: Knex;

  beforeAll(() => {
    db = givenDb({connector: 'postgresql'});
    resolvers = givenWhereResolvers(db.ds);
    knex = createKnex(db.ds);
  });

  describe('BasicSpecs', function () {
    testSpecs(filterSpecs(BasicSpecs));
  });

  describe('ComplexSpecs', function () {
    testSpecs(filterSpecs(ComplexSpecs));
  });

  function testSpecs(specs: WhereSpec[]) {
    specs.forEach(td => {
      it('should build ' + td.name, function () {
        const resolver = resolvers[td.model];
        const qb = knex(resolver.orm.tableEscaped(td.model)).queryContext({skipEscape: true});
        resolver.resolve(qb, td.where, td.session);
        const s = qb.toSQL();
        expect(s.sql).toEqual(td.sql);
        expect(s.bindings).toEqual(td.bindings);
      });
    });
  }
});
