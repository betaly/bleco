import {Foo} from '../fixtures/models/foo';
import {DefaultCrudRepositoryWithObjectQuery} from '../../repository';
import {ObjectQuery} from '../../queries';
import {juggler} from '@loopback/repository';
import {DB, givenDb} from '../support';

describe('DefaultCrudRepositoryWithObjectQuery', function () {
  let db: DB;
  let findSpy: jest.SpyInstance;

  class MyRepository extends DefaultCrudRepositoryWithObjectQuery<Foo, typeof Foo.prototype.id> {
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
    findSpy = jest.spyOn(ObjectQuery.prototype as any, 'find');
  });

  afterEach(() => {
    findSpy.mockRestore();
  });

  it('should mixin ObjectQueryRepository', function () {
    const myRepository = new MyRepository(db.ds);
    expect(myRepository.objectQuery).toBeInstanceOf(ObjectQuery);
  });

  it('should query with ObjectQuery', async () => {
    const myRepository = new MyRepository(db.ds);
    await myRepository.find({where: {id: 1}});
    expect(findSpy).toHaveBeenCalledTimes(1);
  });
});
