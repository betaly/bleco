import {inject} from '@loopback/context';
import {DefaultCrudRepository, juggler} from '@loopback/repository';
import {DefaultRepositoryFactory} from '../../factories';
import {RepoBindings} from '../../keys';
import {DefaultRepositoryFactoryProvider} from '../../providers';
import {TestApplication} from '../fixtures/application';
import {Note} from '../fixtures/models/note.model';
import {Product} from '../fixtures/models/product.model';
import {ProductRepository} from '../fixtures/repositories/product.repository';
import {givenApp} from '../support';

describe('DefaultRepositoryFactory', function () {
  let app: TestApplication;

  beforeEach(async function () {
    app = await givenApp();
  });

  afterEach(async function () {
    await app.stop();
  });

  it('should discover bound repositories from application', async () => {
    const rf = new DefaultRepositoryFactory(app);
    expect(rf.repositories.size).toBe(0);
    await rf.discover();
    expect(rf.repositories.size).toBe(2);
  });

  it('should get repository by Model class', async () => {
    const rf = new DefaultRepositoryFactory(app);
    await rf.discover();
    const noteRepo = await rf.getRepository(Note);
    expect(noteRepo).toBeDefined();
  });

  it('should get repository by Model name', async () => {
    const rf = new DefaultRepositoryFactory(app);
    await rf.discover();
    const noteRepo = await rf.getRepository('Note');
    expect(noteRepo).toBeDefined();
  });

  it('should override repository', async () => {
    const rf = new DefaultRepositoryFactory(app);
    await rf.discover();
    const productRepo = await rf.getRepository(Product);
    expect(productRepo).toBeInstanceOf(ProductRepository);

    app.repository(ProductRepository2);
    await rf.discover();
    const productRepo2 = await rf.getRepository(Product);
    expect(productRepo2).toBeInstanceOf(ProductRepository2);
  });
});

describe('DefaultRepositoryFactoryProvider', function () {
  let app: TestApplication;

  beforeEach(async function () {
    app = await givenApp();
  });

  afterEach(async function () {
    await app.stop();
  });

  it('should work', async () => {
    app.bind(RepoBindings.REPOSITORY_FACTORY).toProvider(DefaultRepositoryFactoryProvider);
    const rf = await app.get<DefaultRepositoryFactory>(RepoBindings.REPOSITORY_FACTORY);
    expect(rf).toBeInstanceOf(DefaultRepositoryFactory);
    const noteRepo = await rf.getRepository(Note);
    expect(noteRepo).toBeDefined();
  });
});

class ProductRepository2 extends DefaultCrudRepository<Product, typeof Product.prototype.id> {
  constructor(
    @inject('datasources.db')
    dataSource: juggler.DataSource,
  ) {
    super(Product, dataSource);
  }
}
