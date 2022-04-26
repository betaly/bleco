import {Knex} from 'knex';
import {juggler} from '@loopback/repository';
import Client = Knex.Client;

export const KnexSupportedClients = {
  MsSQL: 'mssql',
  MySQL: 'mysql',
  MySQL2: 'mysql2',
  Oracle: 'oracledb',
  PostgreSQL: 'pg',
  PgNative: 'pgnative',
  Redshift: 'pg-redshift',
  SQLite: 'sqlite3',
  CockroachDB: 'cockroachdb',
  BetterSQLite3: 'better-sqlite3',
};

export const KnexSupportedClientRegexps = {
  [KnexSupportedClients.MsSQL]: /^mssql|ms$/i,
  [KnexSupportedClients.MySQL]: /^mysql|maria|mariadb$/i,
  [KnexSupportedClients.MySQL2]: /^mysql2$/i,
  [KnexSupportedClients.Oracle]: /^oracledb$/i,
  [KnexSupportedClients.PostgreSQL]: /^pg|postgres|postgresql$/i,
  [KnexSupportedClients.PgNative]: /^pgnative$/i,
  [KnexSupportedClients.Redshift]: /^redshift$/i,
  [KnexSupportedClients.SQLite]: /^sqlite3?$/i,
  [KnexSupportedClients.CockroachDB]: /^cockroachdb$/i,
  [KnexSupportedClients.BetterSQLite3]: /^better-sqlite3$/i,
};

export interface KnexQueryContext {
  skipEscape: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createKnex<TRecord extends {} = any, TResult = unknown[]>(ds: juggler.DataSource): Knex<TRecord, TResult> {
  const client = resolveKnexClientWithDataSource(ds);
  if (!client) {
    throw new Error('Can not detect knex client, you can specify it in dataSource.settings.knex');
  }

  const options: Knex.Config = {
    client,
    wrapIdentifier: (value: string, origImpl: (value: string) => string, queryContext?: KnexQueryContext) => {
      if (queryContext?.skipEscape) {
        return value;
      }
      return origImpl(value);
    },
  };
  if (client === 'sqlite3') {
    // suppress knex sqlite3 useNullAsDefault warning
    options.useNullAsDefault = true;
  }
  return require('knex')(options);
}

export function resolveKnexClientWithDataSource(ds: juggler.DataSource) {
  return resolveKnexClientWithDialect(ds.settings.knex) ?? resolveKnexClientWithDialect(ds.connector?.name);
}

function resolveKnexClientWithDialect(dialect?: string | typeof Client) {
  if (typeof dialect === 'string') {
    for (const client in KnexSupportedClientRegexps) {
      if (KnexSupportedClientRegexps[client].test(dialect)) {
        return client;
      }
    }
  } else if (typeof dialect === 'function') {
    return dialect;
  }
  return null;
}
