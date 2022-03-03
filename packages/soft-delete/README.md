# @bleco/soft-delete

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

> A loopback-next extension for soft delete feature

## Install

```sh
npm install @bleco/soft-delete
```

**NOTE** - With latest version 3.0.0, you also need to install
[@bleco/authentication](https://github.com/betaly/bleco/tree/master/packages/authentication) for using deleted_by
feature added.

```sh
npm install @bleco/soft-delete
```

## Quick Starter

For a quick starter guide, you can refer to our [loopback 4 starter](https://github.com/betaly/loopback4-starter)
application which utilizes this package for soft-deletes in a multi-tenant application.

## Transaction support

With version 3.0.0, transaction repository support has been added. In place of SoftCrudRepository, extend your
repository with DefaultTransactionSoftCrudRepository. For further usage guidelines, refer below.

## Usage

Right now, this extension exports three abstract classes which are actually helping with soft delete operations.

- **SoftDeleteEntity** - An abstract base class for all models which require soft delete feature. This class is a
  wrapper over Entity class from
  [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository) adding three
  attributes to the model class for handling soft-delete, namely, deleted, deletedOn, deletedBy. The column names needed
  to be there in DB within that table are - 'deleted', 'deleted_on', 'deleted_by'. If you are using auto-migration of
  loopback 4, then, you may not need to do anything specific to add this column. If not, then please add these columns
  to the DB table.
- **SoftCrudRepository** - An abstract base class for all repositories which require soft delete feature. This class is
  going to be the one which handles soft delete operations and ensures soft deleted entries are not returned in
  responses, However if there is a need to query soft deleted entries as well,there is an options to achieve that and
  you can use findAll() in place of find() , findOneIncludeSoftDelete() in place of findOne() and
  findByIdIncludeSoftDelete() in place of findById(), these will give you the responses including soft deleted entries.
  This class is a wrapper over DefaultCrudRepository class from
  [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository).
- **DefaultTransactionSoftCrudRepository** - An abstract base class for all repositories which require soft delete
  feature with transaction support. This class is going to be the one which handles soft delete operations and ensures
  soft deleted entries are not returned in responses, However if there is a need to query soft deleted entries as
  well,there is an options to achieve that and you can use findAll() in place of find() , findOneIncludeSoftDelete() in
  place of findOne() and findByIdIncludeSoftDelete() in place of findById(), these will give you the responses including
  soft deleted entries. This class is a wrapper over DefaultTransactionalRepository class from
  [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository).

In order to use this extension in your LB4 application, please follow below steps.

1. Extend models with SoftDeleteEntity class replacing Entity. For example,

```ts
import {model, property} from '@loopback/repository';
import {SoftDeleteEntity} from '@bleco/soft-delete';

@model({
  name: 'users',
})
export class User extends SoftDeleteEntity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  // .... More properties
}
```

2. Extend repositories with SoftCrudRepository class replacing DefaultCrudRepository. For example,

```ts
import {Getter, inject} from '@loopback/core';
import {SoftCrudRepository} from '@bleco/soft-delete';
import {AuthenticationBindings, IAuthUser} from '@bleco/authentication';

import {PgdbDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends SoftCrudRepository<User, typeof User.prototype.id, UserRelations> {
  constructor(
    @inject('datasources.pgdb') dataSource: PgdbDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    protected readonly getCurrentUser: Getter<IAuthUser | undefined>,
  ) {
    super(User, dataSource, getCurrentUser);
  }
}
```

3. For transaction support, extend repositories with DefaultTransactionSoftCrudRepository class replacing
   DefaultTransactionalRepository. For example,

```ts
import {Getter, inject} from '@loopback/core';
import {SoftCrudRepository} from '@bleco/soft-delete';
import {AuthenticationBindings, IAuthUser} from '@bleco/authentication';

import {PgdbDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends DefaultTransactionSoftCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.pgdb') dataSource: PgdbDataSource,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    protected readonly getCurrentUser: Getter<IAuthUser | undefined>,
  ) {
    super(User, dataSource, getCurrentUser);
  }
}
```

## Feedback

If you've noticed a bug or have a question or have a feature request,
[search the issue tracker](https://github.com/betaly/bleco/issues) to see if someone else in the community has already
created a ticket. If not, go ahead and [make one](https://github.com/betaly/bleco/issues/new/choose)! All feature
requests are welcome. Implementation time may vary. Feel free to contribute the same, if you can. If you think this
extension is useful, please [star](https://help.github.com/en/articles/about-stars) it. Appreciation really helps in
keeping this project alive.

## Contributing

Please read [CONTRIBUTING.md](https://github.com/betaly/bleco/blob/master/.github/CONTRIBUTING.md) for details on the
process for submitting pull requests to us.

## Code of conduct

Code of conduct guidelines [here](https://github.com/betaly/bleco/blob/master/.github/CODE_OF_CONDUCT.md).

## License

[MIT](https://github.com/betaly/bleco/blob/master/LICENSE)
