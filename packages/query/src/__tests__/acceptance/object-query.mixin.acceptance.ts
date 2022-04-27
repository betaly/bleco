import {Entity, EntityCrudRepository} from '@loopback/repository';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Constructor} from '@loopback/core';
import {DB, givenDb} from '../support';
import {ObjectQuery} from '../../queries';
import {
  FooRepositoryWithObjectQueryDecorated,
  FooRepositoryWithObjectQueryDecoratedFull,
  FooRepositoryWithObjectQueryExtended,
} from '../fixtures/repositories/foo.repository';
import {seed} from '../fixtures/seed';
import {ObjectQueryRepository} from '../../mixins';
import {Foo} from '../fixtures/models/foo';

type ModelRepository<T extends Entity> = EntityCrudRepository<T, unknown> & ObjectQueryRepository<T>;
type ModelRepositoryCtor<T extends Entity> = Constructor<ModelRepository<T>>;

const MixinSpecs: [string, ModelRepositoryCtor<Foo>][] = [
  ['extends', FooRepositoryWithObjectQueryExtended],
  ['decorator', FooRepositoryWithObjectQueryDecoratedFull],
];

describe('ObjectQuery Mixin', () => {
  let db: DB;

  let findSpy: jest.SpyInstance;
  let findOneSpy: jest.SpyInstance;
  let countSpy: jest.SpyInstance;

  beforeAll(async () => {
    db = givenDb({connector: 'sqlite3', file: ':memory:'});
    await db.ds.automigrate();
    await seed(db.repos);
  });

  describe('mixin without overrideCruds', () => {
    let repo: FooRepositoryWithObjectQueryDecorated;

    beforeAll(() => {
      repo = new FooRepositoryWithObjectQueryDecorated(db.ds);
      findSpy = jest.spyOn(repo.objectQuery!, 'find');
      findOneSpy = jest.spyOn(repo.objectQuery!, 'findOne');
      countSpy = jest.spyOn(repo.objectQuery!, 'count');
    });

    afterAll(async () => {
      findSpy.mockRestore();
      countSpy.mockRestore();
    });

    afterEach(async () => {
      findSpy.mockClear();
      countSpy.mockClear();
    });

    it('should not override original cruds', async () => {
      const filter = {where: {name: {like: '%Foo%'}}};
      await repo.find(filter);
      expect(findSpy).not.toHaveBeenCalled();
      await (repo as any).findOne(filter);
      expect(findOneSpy).not.toHaveBeenCalled();
      await repo.count(filter.where);
      expect(countSpy).not.toHaveBeenCalled();
    });
  });

  for (const [name, Repo] of MixinSpecs) {
    describe(`mixin with ${name}`, () => {
      let repo: ModelRepository<Foo>;

      beforeAll(() => {
        repo = new Repo(db.ds);
        findSpy = jest.spyOn(repo.objectQuery!, 'find');
        findOneSpy = jest.spyOn(repo.objectQuery!, 'findOne');
        countSpy = jest.spyOn(repo.objectQuery!, 'count');
      });

      afterAll(async () => {
        findSpy.mockRestore();
        countSpy.mockRestore();
      });

      afterEach(async () => {
        findSpy.mockClear();
        countSpy.mockClear();
      });

      it('should initiate ObjectQuery mixed repository', async () => {
        expect(repo.objectQuery).toBeInstanceOf(ObjectQuery);
      });

      it('find with ObjectQuery.find method', async () => {
        const filter = {where: {name: {like: '%Foo%'}}};
        await repo.find(filter);
        expect(findSpy).toHaveBeenCalledWith(filter, undefined);
      });

      it('findOne with ObjectQuery.findOne method', async () => {
        const filter = {where: {name: {like: '%Foo%'}}};
        expect('findOne' in repo).toBe(true);
        await (repo as any).findOne(filter);
        expect(findOneSpy).toHaveBeenCalledWith(filter, undefined);
      });

      it('count with ObjectQuery.count method', async () => {
        const where = {name: {like: '%Foo%'}};
        await repo.count(where);
        expect(countSpy).toHaveBeenCalledWith(where, undefined);
      });

      it('select with ObjectQuery.find method', async () => {
        const filter = {where: {name: {like: '%Foo%'}}};
        await repo.select(filter);
        expect(findSpy).toHaveBeenCalledWith(filter, undefined);
      });

      it('slectOne with ObjectQuery.findOne method', async () => {
        const filter = {where: {name: {like: '%Foo%'}}};
        await repo.selectOne(filter);
        expect(findOneSpy).toHaveBeenCalledWith(filter, undefined);
      });

      it('selectCount with ObjectQuery.count method', async () => {
        const where = {name: {like: '%Foo%'}};
        await repo.selectCount(where);
        expect(countSpy).toHaveBeenCalledWith(where, undefined);
      });
    });
  }
});
