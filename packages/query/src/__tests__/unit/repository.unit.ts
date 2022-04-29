import {juggler} from '@loopback/repository';
import {DefaultQuery} from '../../query';
import {DefaultCrudRepositoryWithQuery} from '../../repository';
import {DB, givenDb} from '../support';
import {Foo} from '../fixtures/models/foo';

describe('DefaultCrudRepositoryWithQuery', function () {
  let db: DB;
  let findSpy: jest.SpyInstance;

  class MyRepository extends DefaultCrudRepositoryWithQuery<Foo, typeof Foo.prototype.id> {
    constructor(dataSource: juggler.DataSource) {
      super(Foo, dataSource);
    }
  }

  beforeAll(async () => {
    db = givenDb({connector: 'sqlite3', file: ':memory:'});
    await db.ds.automigrate();
  });

  beforeEach(() => {
    findSpy = jest.spyOn(DefaultQuery.prototype, 'find');
  });

  afterEach(() => {
    findSpy.mockRestore();
  });

  it('should mixin QueryRepository', function () {
    const myRepository = new MyRepository(db.ds);
    expect(myRepository.query).toBeInstanceOf(DefaultQuery);
  });

  it('should query with Query', async () => {
    const myRepository = new MyRepository(db.ds);
    await myRepository.find({where: {id: 1}});
    expect(findSpy).toHaveBeenCalledTimes(1);
  });
});
