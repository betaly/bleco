import {DB, givenDb} from '../support';
import {ObjectQuery} from '../../queries';
import {FooRepository} from '../fixtures/repositories/foo.repository';
import {seed} from '../fixtures/seed';

describe('ObjectQuery Mixin', () => {
  let db: DB;
  let fooRepo: FooRepository;

  let findSpy: jest.SpyInstance;
  let findOneSpy: jest.SpyInstance;
  let countSpy: jest.SpyInstance;

  beforeAll(async () => {
    db = givenDb({connector: 'sqlite3', file: ':memory:'});
    fooRepo = new FooRepository(db.ds);
    await db.ds.automigrate();
    await seed(db.repos);
  });

  beforeAll(() => {
    findSpy = jest.spyOn(fooRepo.objectQuery!, 'find');
    findOneSpy = jest.spyOn(fooRepo.objectQuery!, 'findOne');
    countSpy = jest.spyOn(fooRepo.objectQuery!, 'count');
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
    expect(fooRepo.objectQuery).toBeInstanceOf(ObjectQuery);
  });

  it('should call find method', async () => {
    const filter = {where: {name: {like: '%Foo%'}}};
    await fooRepo.find(filter);
    expect(findSpy).toHaveBeenCalledWith(filter, undefined);
  });

  it('should call findOne method', async () => {
    const filter = {where: {name: {like: '%Foo%'}}};
    await fooRepo.findOne(filter);
    expect(findOneSpy).toHaveBeenCalledWith(filter, undefined);
  });

  it('should call count method', async () => {
    const where = {name: {like: '%Foo%'}};
    await fooRepo.count(where);
    expect(countSpy).toHaveBeenCalledWith(where, undefined);
  });
});
