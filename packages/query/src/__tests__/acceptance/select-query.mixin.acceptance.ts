import {Entity, EntityCrudRepository} from '@loopback/repository';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Constructor} from '@loopback/core';
import {DB, givenDb} from '../support';
import {SelectQuery} from '../../queries';
import {
  FooRepositoryWithSelectQueryDecorated,
  FooRepositoryWithSelectQueryDecoratedFull,
  FooRepositoryWithSelectQueryExtended,
} from '../fixtures/repositories/foo.repository';
import {seed} from '../fixtures/seed';
import {SelectQueryRepository} from '../../mixins';
import {Foo} from '../fixtures/models/foo';

type ModelRepository<T extends Entity> = EntityCrudRepository<T, unknown> & SelectQueryRepository<T>;
type ModelRepositoryCtor<T extends Entity> = Constructor<ModelRepository<T>>;

const MixinSpecs: [string, ModelRepositoryCtor<Foo>][] = [
  ['extends', FooRepositoryWithSelectQueryExtended],
  ['decorator', FooRepositoryWithSelectQueryDecoratedFull],
];

describe('SelectQuery Mixin', () => {
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
    let repo: FooRepositoryWithSelectQueryDecorated;

    beforeAll(() => {
      repo = new FooRepositoryWithSelectQueryDecorated(db.ds);
      findSpy = jest.spyOn(repo.selectQuery!, 'find');
      findOneSpy = jest.spyOn(repo.selectQuery!, 'findOne');
      countSpy = jest.spyOn(repo.selectQuery!, 'count');
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
        findSpy = jest.spyOn(repo.selectQuery!, 'find');
        findOneSpy = jest.spyOn(repo.selectQuery!, 'findOne');
        countSpy = jest.spyOn(repo.selectQuery!, 'count');
      });

      afterAll(async () => {
        findSpy.mockRestore();
        countSpy.mockRestore();
      });

      afterEach(async () => {
        findSpy.mockClear();
        countSpy.mockClear();
      });

      it('should initiate SelectQuery mixed repository', async () => {
        expect(repo.selectQuery).toBeInstanceOf(SelectQuery);
      });

      it('find with SelectQuery.find method', async () => {
        const filter = {where: {name: {like: '%Foo%'}}};
        await repo.find(filter);
        expect(findSpy).toHaveBeenCalledWith(filter, undefined);
      });

      it('findOne with SelectQuery.findOne method', async () => {
        const filter = {where: {name: {like: '%Foo%'}}};
        expect('findOne' in repo).toBe(true);
        await (repo as any).findOne(filter);
        expect(findOneSpy).toHaveBeenCalledWith(filter, undefined);
      });

      it('count with SelectQuery.count method', async () => {
        const where = {name: {like: '%Foo%'}};
        await repo.count(where);
        expect(countSpy).toHaveBeenCalledWith(where, undefined);
      });

      it('select with SelectQuery.find method', async () => {
        const filter = {where: {name: {like: '%Foo%'}}};
        await repo.select(filter);
        expect(findSpy).toHaveBeenCalledWith(filter, undefined);
      });

      it('slectOne with SelectQuery.findOne method', async () => {
        const filter = {where: {name: {like: '%Foo%'}}};
        await repo.selectOne(filter);
        expect(findOneSpy).toHaveBeenCalledWith(filter, undefined);
      });

      it('selectCount with SelectQuery.count method', async () => {
        const where = {name: {like: '%Foo%'}};
        await repo.selectCount(where);
        expect(countSpy).toHaveBeenCalledWith(where, undefined);
      });
    });
  }
});
