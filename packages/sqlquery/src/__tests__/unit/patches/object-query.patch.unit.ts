/* eslint-disable @typescript-eslint/no-explicit-any */
import {Constructor} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Foo} from '../../fixtures/models/foo';
import {
  patchObjectQueryToRepositoryClass,
  patchObjectQueryToRepository,
  unpatchObjectQueryFromRepositoryClass,
  unpatchObjectQueryFromRepository,
  ObjectQueryFns,
} from '../../../patches';
import {DB, givenDb} from '../../support';
import {ObjectQuery} from '../../../queries';
import {originalProp} from '../../../utils';

describe('patch/unpatch', () => {
  let db: DB;
  let memdb: DB;
  let FooRepository: Constructor<DefaultCrudRepository<any, any>>;

  const objectQuerySpies: Record<string, jest.SpyInstance> = {};
  const originalSpies: Record<string, jest.SpyInstance> = {};

  beforeAll(async () => {
    db = givenDb({connector: 'sqlite3', file: ':memory:'});
    memdb = givenDb({connector: 'memory'});
    await db.ds.automigrate();
    await memdb.ds.automigrate();
  });

  beforeEach(() => {
    FooRepository = givenRepository();
    for (const method of ObjectQueryFns) {
      objectQuerySpies[method] = jest.spyOn(ObjectQuery.prototype as any, method);
      originalSpies[method] = jest.spyOn(FooRepository.prototype, method);
    }
  });

  afterEach(() => {
    for (const method of ObjectQueryFns) {
      objectQuerySpies[method].mockRestore();
      originalSpies[method].mockRestore();
    }
  });

  describe('patch', function () {
    it('should patch a Repository class', () => {
      const proto = FooRepository.prototype;
      assertNotPatched(proto);
      const result = patchObjectQueryToRepositoryClass(FooRepository);
      expect(result).toBe(true);
      assertPatched(proto);
    });

    it('should patch a Repository instance', () => {
      const repo = new FooRepository(db.ds);
      assertNotPatched(repo);
      const result = patchObjectQueryToRepository(repo);
      expect(result).toBe(true);
      assertPatched(repo);
    });

    it('should skip if has been patched', () => {
      const result = patchObjectQueryToRepositoryClass(FooRepository);
      expect(result).toBe(true);
      const result2 = patchObjectQueryToRepositoryClass(FooRepository);
      expect(result2).toBeNull();
    });

    it('should return false for null target', () => {
      const result = patchObjectQueryToRepository(null as any);
      expect(result).toBe(false);
    });

    it('should return false for non-Repository target', () => {
      const target = {};
      const result = patchObjectQueryToRepository(target as any);
      expect(result).toBe(false);
      assertNotPatched(target);
    });

    describe('query with ObjectQuery', () => {
      for (const method of ObjectQueryFns) {
        it(`should query with ObjectQuery "${method}"`, async () => {
          const result = patchObjectQueryToRepositoryClass(FooRepository);
          expect(result).toBe(true);
          const repo = new FooRepository(db.ds) as any;
          await repo[method]();
          expect(objectQuerySpies[method]).toHaveBeenCalledTimes(1);
          expect(originalSpies[method]).not.toHaveBeenCalled();
        });
      }
    });

    describe('query with original', () => {
      for (const method of ObjectQueryFns) {
        it(`should query with original "${method}"`, async () => {
          const result = patchObjectQueryToRepositoryClass(FooRepository);
          expect(result).toBe(true);
          const repo = new FooRepository(memdb.ds) as any;
          await repo[method]();
          expect(objectQuerySpies[method]).not.toHaveBeenCalled();
          expect(originalSpies[method]).toHaveBeenCalledTimes(1);
        });
      }
    });
  });

  describe('unpatch', function () {
    it('should unpatch a Repository class', () => {
      const proto = FooRepository.prototype;
      patchObjectQueryToRepositoryClass(FooRepository);
      assertPatched(proto);
      unpatchObjectQueryFromRepositoryClass(FooRepository);
      assertNotPatched(proto);
    });

    it('should unpatch a Repository instance', () => {
      const repo = new FooRepository(db.ds);
      patchObjectQueryToRepository(repo);
      assertPatched(repo);
      unpatchObjectQueryFromRepository(repo);
      assertNotPatched(repo);
    });
  });
});

function givenRepository(): Constructor<DefaultCrudRepository<any, any>> {
  class FooRepository extends DefaultCrudRepository<Foo, number> {
    constructor(dataSource: juggler.DataSource) {
      super(Foo, dataSource);
    }
  }
  return FooRepository;
}

function assertNotPatched(target: any) {
  expect(target.__getObjectQuery__).not.toBeDefined();
  expect(target.__objectQuery__).not.toBeDefined();
  for (const method of ObjectQueryFns) {
    expect(target[originalProp(method)]).not.toBeDefined();
  }
}

function assertPatched(target: any) {
  expect(target.__getObjectQuery__).toBeDefined();
  for (const method of ObjectQueryFns) {
    expect(target[originalProp(method)]).toBeDefined();
  }
}
