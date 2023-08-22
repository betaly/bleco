import {Application, ValueOrPromise} from '@loopback/core';
import {Class, RepositoryMixin, juggler} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';

import {RatelimitStoreSourceProvider} from '../../providers';
import {RateLimitStoreClientType, RateLimitStoreSource} from '../../types';
import {
  KvMemoryDataSource,
  KvRedisDataSource,
  MemoryDataSource,
  MongoDataSource,
  MySQLDataSource,
  PostgresDataSource,
  RedisDataSource,
} from '../fixtures/datasources';
import {mockAllStoreClients} from '../fixtures/mocks';

class TestApplication extends RepositoryMixin(RestApplication) {}

const DATA_SOURCES = [
  KvMemoryDataSource,
  KvRedisDataSource,
  MemoryDataSource,
  MongoDataSource,
  MySQLDataSource,
  PostgresDataSource,
  RedisDataSource,
];

describe('Rate Limit StoreSource Service', () => {
  const app = new TestApplication();
  let spies: jest.SpyInstance[];

  beforeAll(() => {
    spies = mockAllStoreClients();
    DATA_SOURCES.map(ds => app.dataSource(ds));
  });

  afterAll(async () => {
    spies.map(spy => spy.mockRestore());
    await app.stop();
  });

  describe('Ratelimit storesource with config', () => {
    it('kv-memory', async () => testWithDataSource(app, KvMemoryDataSource, RateLimitStoreClientType.Memory));
    it('kv-redis', async () => testWithDataSource(app, KvRedisDataSource, RateLimitStoreClientType.Redis));
    it('memory', async () => testWithDataSource(app, MemoryDataSource, RateLimitStoreClientType.Memory));
    it('redis', async () => testWithDataSource(app, RedisDataSource, RateLimitStoreClientType.Redis));
    it('mongodb', async () => testWithDataSource(app, MongoDataSource, RateLimitStoreClientType.MongoDB));
    it('mysql', async () => testWithDataSource(app, MySQLDataSource, RateLimitStoreClientType.MySQL));
    it('postgres', async () => testWithDataSource(app, PostgresDataSource, RateLimitStoreClientType.Postgres));
  });
});

async function testWithDataSource(
  app: Application,
  ds: Class<juggler.DataSource>,
  expectedClientType: RateLimitStoreClientType,
  assertFn?: (storeSource: RateLimitStoreSource) => ValueOrPromise<void>,
) {
  const storeSource = await new RatelimitStoreSourceProvider(() => Promise.resolve({enabled: true}), app, {
    ds,
  }).value();
  expect(storeSource.type).toEqual(expectedClientType);
  await assertFn?.(storeSource);
}
