import {mixin} from '@bleco/mixin';
import {DefaultCrudRepository, Entity, juggler, model, property} from '@loopback/repository';

import {
  UserType,
  UserUpdatableModel,
  UserUpdatableModelMixin,
  UserUpdatableRepository,
  UserUpdatableRepositoryMixin,
} from '../../mixins';

describe('UserUpdatableMixin', function () {
  let ds: juggler.DataSource;
  let repo: BookRepository;

  @model()
  @mixin(UserUpdatableModelMixin)
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

    constructor(data?: Partial<Book>) {
      super(data);
    }
  }

  interface Book extends UserUpdatableModel {}

  @mixin(UserUpdatableRepositoryMixin({throwIfNoUser: true, userIdKey: ['userTenantId', 'id']}))
  class BookRepository extends DefaultCrudRepository<Book, typeof Book.prototype.id> {
    constructor(dataSource: juggler.DataSource) {
      super(Book, dataSource);
    }
  }
  interface BookRepository extends UserUpdatableRepository<Book, typeof Book.prototype.id, Book> {}

  beforeEach(async () => {
    ds = givenDataSource();
    repo = new BookRepository(ds);
    await ds.automigrate();
  });

  testWithUser('with user', [{id: 'user1'}, {id: 'user2'}]);
  testWithUser('with tenant user', [{userTenantId: 'tenant_user1'}, {userTenantId: 'tenant_user2'}]);

  function testWithUser(title: string, users: [UserType, UserType]) {
    describe(title, function () {
      const user1 = users[0];
      const user2 = users[1];

      const user1Id = user1.userTenantId ?? user1.id;
      const user2Id = user2.userTenantId ?? user2.id;

      it('should set createdBy and updatedBy on create', async () => {
        repo.getCurrentUser = () => Promise.resolve(user1);
        const book = await repo.create({name: 'book 1', type: 'fiction'});
        expect(book.createdBy).toBeDefined();
        expect(book.createdBy).toBe(book.updatedBy);
      });

      it('should set createdBy and updatedBy on createAll', async () => {
        repo.getCurrentUser = () => Promise.resolve(user1);
        const books = await repo.createAll([{name: 'book 1', type: 'fiction'}]);
        expect(books[0].createdBy).toBeDefined();
        expect(books[0].createdBy).toBe(books[0].updatedBy);
      });

      it('should set updatedBy on save', async () => {
        repo.getCurrentUser = () => Promise.resolve(user1);
        const book = await repo.create({name: 'book 1', type: 'fiction'});
        repo.getCurrentUser = () => Promise.resolve(user2);
        book.name = 'non-fiction';
        await repo.save(book);
        const book2 = await repo.findById(book.id);
        expect(book2.createdBy).toBe(user1Id);
        expect(book2.updatedBy).toBe(user2Id);
      });

      it('should set updatedBy on updateById', async () => {
        repo.getCurrentUser = () => Promise.resolve(user1);
        const book = await repo.create({name: 'book 1', type: 'fiction'});
        repo.getCurrentUser = () => Promise.resolve(user2);
        await repo.updateById(book.id, {name: 'non-fiction'});
        const book2 = await repo.findById(book.id);
        expect(book2.createdBy).toBe(user1Id);
        expect(book2.updatedBy).toBe(user2Id);
      });

      it('should set updatedBy on update', async () => {
        repo.getCurrentUser = () => Promise.resolve(user1);
        const book = await repo.create({name: 'book 1', type: 'fiction'});
        repo.getCurrentUser = () => Promise.resolve(user2);
        const book2 = await repo.findById(book.id);
        book2.name = 'non-fiction';
        await repo.update(book2);
        const book3 = await repo.findById(book.id);
        expect(book3.createdBy).toBe(user1Id);
        expect(book3.updatedBy).toBe(user2Id);
      });

      it('should set updatedBy on updateAll', async () => {
        repo.getCurrentUser = () => Promise.resolve(user1);
        const book = await repo.create({name: 'book 1', type: 'fiction'});
        repo.getCurrentUser = () => Promise.resolve(user2);
        const book2 = await repo.findById(book.id);
        book2.name = 'non-fiction';
        await repo.updateAll(book2);
        const book3 = await repo.findById(book.id);
        expect(book3.createdBy).toBe(user1Id);
        expect(book3.updatedBy).toBe(user2Id);
      });

      it('should set updatedBy on replaceById', async () => {
        repo.getCurrentUser = () => Promise.resolve(user1);
        const book = await repo.create({name: 'book 1', type: 'fiction'});
        repo.getCurrentUser = () => Promise.resolve(user2);
        await repo.replaceById(book.id, {name: 'non-fiction'});
        const book2 = await repo.findById(book.id);
        expect(book2.createdBy).toBe(user1Id);
        expect(book2.updatedBy).toBe(user2Id);
      });
    });
  }

  describe('without user', function () {
    const InvalidCredentials = 'Invalid Credentials';

    describe('throwIfNoUser = true', function () {
      it('should throw error is no user provided on create', async () => {
        await expect(repo.create({name: 'book 1', type: 'fiction'})).rejects.toThrow(InvalidCredentials);
      });

      it('should throw error is no user provided on createAll', async () => {
        await expect(repo.createAll([{name: 'book 1', type: 'fiction'}])).rejects.toThrow(InvalidCredentials);
      });

      it('should throw error is no user provided on updateById', async () => {
        await expect(repo.updateById(1, {name: 'book 1', type: 'fiction'})).rejects.toThrow(InvalidCredentials);
      });

      it('should throw error is no user provided on updateAll', async () => {
        await expect(repo.updateAll({name: 'book 1', type: 'fiction'}, {})).rejects.toThrow(InvalidCredentials);
      });

      it('should throw error is no user provided on replaceById', async () => {
        await expect(repo.replaceById(1, {name: 'book 1', type: 'fiction'})).rejects.toThrow(InvalidCredentials);
      });

      it('should throw error is no user provided on save', async () => {
        await expect(repo.save(new Book({name: 'book 1', type: 'fiction'}))).rejects.toThrow(InvalidCredentials);
      });
    });

    describe('throwIfNoUser = false', function () {
      let userOptionalRepo: BookRepository;

      @mixin(UserUpdatableRepositoryMixin({throwIfNoUser: false}))
      class UserOptionalBookRepository extends DefaultCrudRepository<Book, typeof Book.prototype.id> {
        constructor(dataSource: juggler.DataSource) {
          super(Book, dataSource);
        }
      }
      interface UserOptionalBookRepository extends UserUpdatableRepository<Book, typeof Book.prototype.id, Book> {}

      beforeEach(async () => {
        userOptionalRepo = new UserOptionalBookRepository(ds);
      });

      it('should not throw error is no user provided on create', async () => {
        await expect(userOptionalRepo.create({name: 'book 1', type: 'fiction'})).resolves.toBeDefined();
      });

      it('should not throw error is no user provided on createAll', async () => {
        await expect(userOptionalRepo.createAll([{name: 'book 1', type: 'fiction'}])).resolves.toBeDefined();
      });

      it('should not throw error is no user provided on updateById', async () => {
        const book = await userOptionalRepo.create({name: 'book 1', type: 'fiction'});
        await userOptionalRepo.updateById(book.id, {type: 'non-fiction'});
      });

      it('should not throw error is no user provided on updateAll', async () => {
        const book = await userOptionalRepo.create({name: 'book 1', type: 'fiction'});
        await expect(userOptionalRepo.updateAll({type: 'non-fiction'}, {id: book.id})).resolves.toBeDefined();
      });

      it('should not throw error is no user provided on replaceById', async () => {
        const book = await userOptionalRepo.create({name: 'book 1', type: 'fiction'});
        await userOptionalRepo.replaceById(book.id, {type: 'non-fiction'});
      });

      it('should not throw error is no user provided on save', async () => {
        await expect(userOptionalRepo.save(new Book({name: 'book 1', type: 'fiction'}))).resolves.toBeDefined();
      });
    });
  });

  function givenDataSource() {
    return new juggler.DataSource({
      name: 'db',
      connector: 'memory',
    });
  }
});
