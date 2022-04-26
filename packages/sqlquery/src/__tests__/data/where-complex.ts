export default [
  {
    name: 'empty query',
    model: 'Org',
    where: {},
    sql: 'select * from "public"."org"',
    bindings: [],
  },
  {
    name: 'query with "or"',
    model: 'Org',
    where: {or: [{billingAddress: 'a'}, {billingAddress: 'b'}]},
    sql: 'select * from "public"."org" where (("billing_address" = ?) or ("billing_address" = ?))',
    bindings: ['a', 'b'],
  },
  {
    name: 'query with unknown property',
    model: 'Org',
    where: {or: [{billingAddress: 'a'}, {unknownProperty: 'b'}]},
    sql: 'select * from "public"."org" where (("billing_address" = ?))',
    bindings: ['a'],
  },
  {
    name: 'query with nested fields',
    model: 'User',
    where: {'address.city': 'a'},
    sql: 'select * from "public"."user" where "address"->>\'city\' = ?',
    bindings: ['a'],
  },
  {
    name: 'query with simple relations',
    model: 'Org',
    where: {'projs.issues.title': {like: '%query%'}},
    sql: 'select * from "public"."org" where "t_0_0_issue"."title" like ?',
    bindings: ['%query%'],
    session: {
      relationWhere: {
        'projs.issues.title': {
          prefix: 't_0_0_',
          model: 'Issue',
          property: {key: 'title'},
          value: '%query%',
        },
      },
    },
  },
];
