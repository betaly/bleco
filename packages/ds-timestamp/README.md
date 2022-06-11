# @bleco/ds-timestamp

> A loopback next extension for automatically adding and managing createAt and updatedAt attributes to Model

## Usage

```ts
// book.model.ts
import {TimestampMixin} from '';
import {Entity, model, property} from '@loopback/repository';

@model()
@mixin(TimestampModelMixin)
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

interface Book extends TimestampModel {}
```

```ts
// book.repository.ts
import {mixin} from '@bleco/mixin';
import {TimestampModelMixin} from '';
import {DefaultCrudRepository} from '@loopback/repository';
import {Book} from '../models';

@mixin(TimestampRepositoryMixin)
class BookRepository extends DefaultCrudRepository<Book, typeof Book.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Book, dataSource);
  }
}
```

## License

[MIT](LICENSE)
