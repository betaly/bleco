/* eslint-disable @typescript-eslint/no-explicit-any */
import {Constructor} from '@loopback/core';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {Foo} from '../../fixtures/models/foo';
import {
  patchSelectQueryToRepositoryClass,
  patchSelectQueryToRepository,
  unpatchSelectQueryFromRepositoryClass,
  unpatchSelectQueryFromRepository,
  SelectQueryFns,
} from '../../../patches';
import {DB, givenDb} from '../../support';
import {SelectQuery} from '../../../queries';
import {originalProp} from '../../../utils';

describe('patch/unpatch', () => {
  let db: DB;
  let memdb: DB;
  let FooRepository: Constructor<DefaultCrudRepository<any, any>>;

  const selectQuerySpies: Record<string, jest.SpyInstance> = {};
  const originalSpies: Record<string, jest.SpyInstance> = {};

  beforeAll(async () => {
    db = givenDb({connector: 'sqlite3', file: ':memory:'});
    memdb = givenDb({connector: 'memory'});
    await db.ds.automigrate();
    await memdb.ds.automigrate();
  });

  beforeEach(() => {
    FooRepository = givenRepository();
    for (const method of SelectQueryFns) {
      selectQuerySpies[method] = jest.spyOn(SelectQuery.prototype as any, method);
      originalSpies[method] = jest.spyOn(FooRepository.prototype, method);
    }
  });

  afterEach(() => {
    for (const method of SelectQueryFns) {
      selectQuerySpies[method].mockRestore();
      originalSpies[method].mockRestore();
    }
  });

  describe('patch', function () {
    it('should patch a Repository class', () => {
      const proto = FooRepository.prototype;
      assertNotPatched(proto);
      const result = patchSelectQueryToRepositoryClass(FooRepository);
      expect(result).toBe(true);
      assertPatched(proto);
    });

    it('should patch a Repository instance', () => {
      const repo = new FooRepository(db.ds);
      assertNotPatched(repo);
      const result = patchSelectQueryToRepository(repo);
      expect(result).toBe(true);
      assertPatched(repo);
    });

    it('should skip if has been patched', () => {
      const result = patchSelectQueryToRepositoryClass(FooRepository);
      expect(result).toBe(true);
      const result2 = patchSelectQueryToRepositoryClass(FooRepository);
      expect(result2).toBeNull();
    });

    it('should return false for null target', () => {
      const result = patchSelectQueryToRepository(null as any);
      expect(result).toBe(false);
    });

    it('should return false for non-Repository target', () => {
      const target = {};
      const result = patchSelectQueryToRepository(target as any);
      expect(result).toBe(false);
      assertNotPatched(target);
    });

    describe('query with SelectQuery', () => {
      for (const method of SelectQueryFns) {
        it(`should query with SelectQuery "${method}"`, async () => {
          const result = patchSelectQueryToRepositoryClass(FooRepository);
          expect(result).toBe(true);
          const repo = new FooRepository(db.ds) as any;
          await repo[method]();
          expect(selectQuerySpies[method]).toHaveBeenCalledTimes(1);
          expect(originalSpies[method]).not.toHaveBeenCalled();
        });
      }
    });

    describe('query with original', () => {
      for (const method of SelectQueryFns) {
        it(`should query with original "${method}"`, async () => {
          const result = patchSelectQueryToRepositoryClass(FooRepository);
          expect(result).toBe(true);
          const repo = new FooRepository(memdb.ds) as any;
          await repo[method]();
          expect(selectQuerySpies[method]).not.toHaveBeenCalled();
          expect(originalSpies[method]).toHaveBeenCalledTimes(1);
        });
      }
    });

    describe('patch DefaultCurdRepository', () => {
      let findSpy: jest.SpyInstance;

      beforeEach(() => {
        findSpy = jest.spyOn(SelectQuery.prototype as any, 'find');
      });

      afterEach(() => {
        findSpy.mockRestore();
        unpatchSelectQueryFromRepositoryClass(DefaultCrudRepository);
      });

      it('should patch DefaultCrudRepository', () => {
        assertNotPatched(DefaultCrudRepository.prototype);
        assertNotPatched(FooRepository.prototype);
        const result = patchSelectQueryToRepositoryClass(DefaultCrudRepository);
        expect(result).toBe(true);
        assertPatched(DefaultCrudRepository.prototype);
        assertPatched(FooRepository.prototype);
        unpatchSelectQueryFromRepositoryClass(DefaultCrudRepository);
        assertNotPatched(DefaultCrudRepository.prototype);
        assertNotPatched(FooRepository.prototype);
      });

      it('should not be affected if base class has been patched after sub class definition', async () => {
        let repo = new FooRepository(db.ds);
        await repo.find();
        expect(findSpy).not.toHaveBeenCalled();

        patchSelectQueryToRepositoryClass(DefaultCrudRepository);

        repo = new FooRepository(db.ds);
        await repo.find();
        expect(findSpy).not.toHaveBeenCalled();
      });

      it('should query with SelectQuery if base class has been patched before sub class definition', async () => {
        patchSelectQueryToRepositoryClass(DefaultCrudRepository);
        const NewFooRepository = givenRepository();
        const repo = new NewFooRepository(db.ds);
        await repo.find();
        expect(findSpy).toHaveBeenCalled();
      });
    });
  });

  describe('unpatch', function () {
    it('should unpatch a Repository class', () => {
      const proto = FooRepository.prototype;
      patchSelectQueryToRepositoryClass(FooRepository);
      assertPatched(proto);
      unpatchSelectQueryFromRepositoryClass(FooRepository);
      assertNotPatched(proto);
    });

    it('should unpatch a Repository instance', () => {
      const repo = new FooRepository(db.ds);
      patchSelectQueryToRepository(repo);
      assertPatched(repo);
      unpatchSelectQueryFromRepository(repo);
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
  expect(target.__getSelectQuery__).not.toBeDefined();
  expect(target.__selectQuery__).not.toBeDefined();
  for (const method of SelectQueryFns) {
    expect(target[originalProp(method)]).not.toBeDefined();
  }
}

function assertPatched(target: any) {
  expect(target.__getSelectQuery__).toBeDefined();
  for (const method of SelectQueryFns) {
    expect(target[originalProp(method)]).toBeDefined();
  }
}
