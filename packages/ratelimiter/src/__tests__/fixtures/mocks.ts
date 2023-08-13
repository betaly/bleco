import * as pg from 'pg';
import * as mongo from 'mongodb';
import * as mysql from 'mysql2';

export function mockAllStoreClients() {
  return [mockMongo(), mockPostgres(), mockMySQL()];
}

export function mockPostgres() {
  const client = {};
  return jest
    .spyOn(pg.Pool.prototype, 'connect')
    .mockImplementation((callback: (err: Error, client: pg.PoolClient, done: (release?: unknown) => void) => void) => {
      callback(undefined as unknown as Error, client as pg.PoolClient, () => {});
    });
}

export function mockMongo() {
  const client = {
    db: jest.fn().mockReturnValue({}),
  } as unknown as mongo.MongoClient;
  return jest
    .spyOn(mongo.MongoClient.prototype, 'connect')
    .mockImplementation((callback: (error?: mongo.AnyError, client?: mongo.MongoClient) => void) => {
      callback(undefined, client);
    });
}

export function mockMySQL<T>() {
  const client = {
    release: jest.fn(),
  };
  // @ts-ignore
  return jest.spyOn(mysql.Pool.prototype, 'getConnection').mockImplementation((cb: Function) => {
    cb(undefined, client);
  });
}
