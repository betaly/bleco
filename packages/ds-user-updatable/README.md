# @bleco/ds-user-updatable

> A loopback next extension for automatically adding and managing createdBy and updatedBy attributes to Model

## Usage

For example, if you have a model called `Book`:

```ts
// book.model.ts
import {UserUpdatableModelMixin} from '';
import {Entity, model, property} from '@loopback/repository';

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
```

And then, you define a repository with `UserUpdatableRepositoryMixin`:

```ts
// book.repository.ts
import {UserUpdatableRepositoryMixin} from '';
import {mixin} from '@bleco/mixin';
import {DefaultCrudRepository} from '@loopback/repository';

@mixin(UserUpdatableRepositoryMixin({throwIfNoUser: true, userIdKey: ['userTenantId', 'id']}))
class BookRepository extends DefaultCrudRepository<Book, typeof Book.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Book, dataSource);
  }
}

interface BookRepository extends UserUpdatableRepository<Book, typeof Book.prototype.id, Book, string> {}
```

`UserUpdatableRepositoryMixinOptions` is an optional parameter for `@mixin(UserUpdatableRepositoryMixin(options))`

```ts
type UserUpdatableRepositoryMixinOptions = {
  // Throw InvalidCredentials error if no getCurrentUser function provided or no user signed in
  throwIfNoUser?: boolean;
  // The keys of user id in user object. It will try to get user id from user object by keys in order until got a first non null value.
  userIdKey?: string | string[];
};
```

## License

[MIT](LICENSE)
