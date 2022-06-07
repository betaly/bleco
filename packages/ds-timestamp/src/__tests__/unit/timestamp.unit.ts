import {mixin} from '@bleco/mixin';
import {DefaultCrudRepository, Entity, juggler, model, property} from '@loopback/repository';
import delay from 'delay';
import {TimestampEntityMixin, TimestampModel, TimestampRepositoryMixin} from '../../mixins';

describe('TimestampMixin', function () {
  let ds: juggler.DataSource;
  let repo: BookRepository;

  @model()
  @mixin(TimestampEntityMixin)
  class Book extends Entity {
    @property({
      type: 'number',
      id: true,
    })
    id: number;

    @property()
    name: string;

    @property()
    type: string;
  }

  interface Book extends TimestampModel {}

  @mixin(TimestampRepositoryMixin)
  class BookRepository extends DefaultCrudRepository<Book, typeof Book.prototype.id> {
    constructor(dataSource: juggler.DataSource) {
      super(Book, dataSource);
    }
  }

  beforeEach(async () => {
    ds = givenDataSource();
    repo = new BookRepository(ds);
    await ds.automigrate();
  });

  describe('createdAt', function () {
    it('should exist on create', async () => {
      const book = await repo.create({name: 'book 1', type: 'fiction'});
      expect(book.createdAt).toBeDefined();
      expect(book.createdAt).toBeInstanceOf(Date);
    });

    it('should not change on save', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      const book = await repo.findById(book1.id);
      book.name = 'non-fiction';
      await repo.save(book);
      const book2 = await repo.findById(book1.id);
      expect(book2.createdAt!.getTime()).toEqual(book1.createdAt!.getTime());
    });

    it('should not change on updateById', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      await repo.updateById(book1.id, {name: 'non-fiction'});
      const book2 = await repo.findById(book1.id);
      expect(book2.createdAt!.getTime()).toEqual(book1.createdAt!.getTime());
    });

    it('should not change on update', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      const book = await repo.findById(book1.id);
      book.name = 'non-fiction';
      await repo.update(book);
      const book2 = await repo.findById(book1.id);
      expect(book2.createdAt!.getTime()).toEqual(book1.createdAt!.getTime());
    });

    it('should not change on updateAll', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      await repo.updateAll({type: 'non-fiction'}, {id: book1.id});
      const book2 = await repo.findById(book1.id);
      expect(book2.createdAt!.getTime()).toEqual(book1.createdAt!.getTime());
    });

    it('should not change on replaceById', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      await repo.replaceById(book1.id, {name: 'non-fiction'});
      const book2 = await repo.findById(book1.id);
      expect(book2.createdAt!.getTime()).toEqual(book1.createdAt!.getTime());
    });
  });

  describe('updatedAt', function () {
    it('should exist on create', async () => {
      const book = await repo.create({name: 'book 1', type: 'fiction'});
      expect(book.updatedAt).toBeDefined();
      expect(book.updatedAt).toBeInstanceOf(Date);
    });

    it('should be updated on update', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      const book = await repo.findById(book1.id);
      book.name = 'non-fiction';
      await repo.update(book);
      const book2 = await repo.findById(book1.id);
      expect(book2.updatedAt!.getTime()).toBeGreaterThan(book1.updatedAt!.getTime());
    });

    it('should be updated on updateById', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      await repo.updateById(book1.id, {name: 'non-fiction'});
      const book2 = await repo.findById(book1.id);
      expect(book2.updatedAt!.getTime()).toBeGreaterThan(book1.updatedAt!.getTime());
    });

    it('should be updated on updateAll', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      const book2 = await repo.create({name: 'book 2', type: 'fiction'});

      await delay(100);
      await repo.updateAll({type: 'romance'}, {type: 'fiction'});

      const book1Updated = await repo.findById(book1.id);
      const book2Updated = await repo.findById(book2.id);

      expect(book1Updated.updatedAt!.getTime()).toBeGreaterThan(book1.updatedAt!.getTime());
      expect(book2Updated.updatedAt!.getTime()).toBeGreaterThan(book2.updatedAt!.getTime());
    });

    it('should be updated on replaceById', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      await repo.replaceById(book1.id, {name: 'non-fiction'});
      const book2 = await repo.findById(book1.id);
      expect(book2.updatedAt!.getTime()).toBeGreaterThan(book1.updatedAt!.getTime());
    });

    it('should skip changing updatedAt when option passed', async () => {
      const book1 = await repo.create({name: 'book 1', type: 'fiction'});
      await delay(100);
      await repo.updateById(book1.id, {name: 'non-fiction'}, {skipUpdatedAt: true});
      const book2 = await repo.findById(book1.id);
      expect(book2.updatedAt!.getTime()).toEqual(book1.updatedAt!.getTime());
    });
  });

  function givenDataSource() {
    return new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
  }
});
