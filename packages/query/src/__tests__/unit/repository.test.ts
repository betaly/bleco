import {Foo} from '../fixtures/models/foo';
import {DefaultCrudRepositoryWithSelectQuery} from '../../repository';
import {SelectQuery} from '../../queries';
import {juggler} from '@loopback/repository';
import {DB, givenDb} from '../support';

describe('DefaultCrudRepositoryWithSelectQuery', function () {
  let db: DB;
  let findSpy: jest.SpyInstance;

  class MyRepository extends DefaultCrudRepositoryWithSelectQuery<Foo, typeof Foo.prototype.id> {
    constructor(dataSource: juggler.DataSource) {
      super(Foo, dataSource);
    }
  }

  beforeAll(async () => {
    db = givenDb({connector: 'sqlite3', file: ':memory:'});
    await db.ds.automigrate();
  });

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findSpy = jest.spyOn(SelectQuery.prototype as any, 'find');
  });

  afterEach(() => {
    findSpy.mockRestore();
  });

  it('should mixin SelectQueryRepository', function () {
    const myRepository = new MyRepository(db.ds);
    expect(myRepository.selectQuery).toBeInstanceOf(SelectQuery);
  });

  it('should query with SelectQuery', async () => {
    const myRepository = new MyRepository(db.ds);
    await myRepository.find({where: {id: 1}});
    expect(findSpy).toHaveBeenCalledTimes(1);
  });
});
