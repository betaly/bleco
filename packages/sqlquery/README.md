# @bleco/sqlquery

[中文 README](README-CN.md)

> A loopback-next sql queryer based on [Kenx](https://knexjs.org/) that supports INNER JOIN

## Features

- Support cascading filter queries (through `where` clauses such as
  `{where: {'relation_ab.relation_bc.relation_cd.property': 'value'}}`)
- Fully compatible with loopback-next's Where Filter
- Support [hasMany](https://loopback.io/doc/en/lb4/HasMany-relation.html),
  [belongsTo](https://loopback.io/doc/en/lb4/BelongsTo-relation.html),
  [hasOne](https://loopback.io/doc/en/lb4/HasOne-relation.html) and
  [hasManyThrough](https://loopback.io/doc/en/lb4/HasManyThrough-relation.html) Relation
- Support `PostgreSQL`, `MSSQL`, `MySQL`, `MariaDB`, `SQLite3`, `Oracle` relational databases, other databases, extended
  by Mixin The Repository will delegate to the parent's native query method.
- [access](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) and `findOne` loading objects are not supported
  [loaded](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) event.

## Installation

npm:

```shell
npm install @bleco/sqlquery
```

Yarn:

```shell
yarn add @bleco/sqlquery
```

## Getting Started

```ts
import {ObjectQuery} from '@bleco/sqlquery';
import {typequery} from './decorators';
import repository = typequery.repository;

class SomeClass {
  objectQuery: ObjectQuery<SomeEntity>;

  constructor(
    @repository(OrgRepository)
    public orgRepository: OrgRepository,
  ) {
    this.objectQuery = new ObjectQuery(this.orgRepository);
  }

  async findSomeEntity() {
    return this.orgRepository.find({
      where: {
        // Through the name condition of projects, cascade query Org. But the result does not contain the associated object projects. To include associated objects, use the include method.
        'projects.name': 'bleco',
        age: {
          gt: 10,
          lt: 20,
        },
      },
      include: [
        // Contains the associated object projects
        {
          relation: 'projects',
          scope: {
            where: {
              name: 'bleco',
            },
          },
        },
      ],
    });
  }
}
```

## ObjectQuery

A querier that performs model filtering queries through relational cascading conditions.

### use

#### Construct

- `new ObjectQuery(repository)`: Through the `new ObjectQuery(repository)` construct, a Repository instance is passed
  in, which supports include.
- `new ObjectQuery(entityClass, repository)`: Constructed by `new ObjectQuery(entityClass, repository)`, passing in a
  model class and a Repository instance, does not support include.

#### `ObjectQueryRepositoryMixin` inheritance

Extends native `find` and `findOne` support for seamless cascading queries by mixing in Repository with
`ObjectQueryRepositoryMixin`. (Note: not supported [access](https://loopback.io/doc/en/lb3/Operation-hooks.html#access)
for `find` and `findOne` and [loaded](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) event)

syntax:

```ts
declare function ObjectQueryRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
>(superClass: R, mixinOptions: boolean | ObjectQueryMixinOptions = {});
```

parameters:

- `superClass`: the inherited class
- `mixinOptions: boolean | ObjectQueryMixinOptions`: mixin options
  - `overrideCruds`: whether to override native CRUD methods, the default is `false`

```ts
export class FooRepository
  extends ObjectQueryRepositoryMixin<
    Foo,
    typeof Foo.prototype.id,
    FooRelations,
    Constructor<DefaultCrudRepository<Foo, typeof Foo.prototype.id, FooRelations>>
  >(DefaultCrudRepository, {overrideCruds: true})
  implements DefaultCrudRepository<Foo, typeof Foo.prototype.id, FooRelations>
{
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}
```

#### `mixinObjectQuery` decorator

syntax:

```ts
declare function mixinObjectQuery(mixinOptions: boolean | ObjectQueryMixinOptions = false);
```

parameters:

- `superClass`: the inherited class
- `mixinOptions: boolean | ObjectQueryMixinOptions`: mixin options
  - `overrideCruds`: whether to override native CRUD methods, the default is `false`

```ts
@mixinObjectQuery(true)
export class FooRepositoryWithObjectQueryDecorated extends DefaultCrudRepository<Foo, typeof Foo.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

export interface FooRepositoryWithObjectQueryDecorated extends ObjectQueryRepository<Foo> {}
```

The class mixed with `ObjectQueryRepositoryMixin` or `mixinObjectQuery` has the interface function of
`ObjectQueryRepository`.

```ts
// interface ObjectQueryRepositoryMixin

export interface ObjectQueryRepository<M extends Entity, Relations extends object = {}> {
  readonly objectQuery?: ObjectQuery<M, Relations>;

  /**
   * Find all entities that match the given filter with ObjectQuery
   * @param filter The filter to apply
   * @param options Options for the query
   */
  select(filter?: QueryFilter<M>, options?: object): Promise<(M & Relations)[]>;

  /**
   * Find first entity that matches the given filter with ObjectQuery
   * @param filter The filter to apply
   * @param options Options for the query
   */
  selectOne(filter?: QueryFilter<M>, options?: object): Promise<(M & Relations) | null>;

  /**
   * Count all entities that match the given filter with ObjectQuery
   * @param where The where to apply
   * @param options Options for the query
   */
  selectCount(where?: QueryWhere<M>, options?: object): Promise<{count: number}>;
}
```

#### `DefaultCrudRepositoryWithObjectQuery` that inherits from `DefaultCrudRepository` and implements `mixinObjectQuery`

`DefaultCrudRepository` is the default CRUD interface implementation of `loopback`, which has all the functions of the
CRUD interface. Most business repositories inherit from it.

Here we provide a method that inherits from `DefaultCrudRepository` and implements `mixinObjectQuery`
`DefaultCrudRepositoryWithObjectQuery` replacement class, `ObjectQuery` replaces `find`, `findOne` and `count` native
queries. For non-relational The database will be passed directly to the native query.

#### Patching

For historical projects, it is not convenient to use Mixin or inheritance for refactoring. Therefore, we provide a
Patching scheme that can be initialized in the application, not yet `patching` the `DefaultCrudRepository` before
loading.

```ts
import {patchObjectQueryToRepositoryClass} from '@bleco/sqlquery';
import {DefaultCrudRepository} from '@loopback/repository';

export async function main(options: ApplicationConfig = {}) {
  // patching `DefaultCrudRepository`
  patchObjectQueryToRepositoryClass(DefaultCrudRepository);

  const app = new TodoListApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  return app;
}
```

- `patchObjectQueryToRepositoryClass(repoClass)`: Patching a `Repository` class
  ```ts
  patchObjectQueryToRepositoryClass(DefaultCrudRepository);
  ```
- `patchObjectQueryToRepository(repo)`: Patching a `Repository` instance

  ```ts
  // patching a repository instance
  patchObjectQueryToRepository(repository);

  // or in a Repository definition
  class MyRepository extends DefaultCrudRepository<MyModel, typeof MyModel.prototype.id> {
    constructor(dataSource: juggler.DataSource) {
      super(MyModel, dataSource);
      patchObjectQueryToRepository(this);
    }
  }
  ```

#### ObjectQuery API

- `ObjectQuery.prototype.find(filter?: QueryFilter<M>, options?): Promise<(M & Relations)[]>`: According to the
  specified filter, find all There are model instances
- `ObjectQuery.prototype.findOne(filter?: QueryFilter<M>, options?): Promise<(M & Relations) | null>`: according to the
  specified filter , to find the first model instance
- `ObjectQuery.prototype.count(filter?: QueryFilter<M>, options?): Promise<{count: numer}>`: According to the specified
  filter, the statistical model number of instances

#### QueryFilter

Compatible with loopback native [Filter](https://loopback.io/doc/en/lb4/Querying-data.html#filters). Extended support
for cascading paths as `where` children query condition.

```ts
export type QueryWhere<MT extends object = AnyObject> = Where<MT & Record<string, any>>;

export interface QueryFilter<MT extends object = AnyObject> extends Filter<MT> {
  where?: QueryWhere<MT>;
}
```

For example, there are the following models:

```ts
// user.model.ts
@model()
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  email?: string;

  @hasMany(() => Org, {through: {model: () => OrgUser}})
  orgs: Org[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}
```

```ts
// org.model.ts
@model()
export class Org extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @hasMany(() => User, {through: {model: () => OrgUser}})
  users: User[];

  @hasMany(() => Proj, {keyTo: 'org_id'})
  projs: Proj[];

  constructor(data?: Partial<Org>) {
    super(data);
  }
}
```

```ts
// proj.model.ts
@model()
export class Proj extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  title?: string;

  @belongsTo(() => Org, {name: 'org'})
  org_id?: number;

  constructor(data?: Partial<Proj>) {
    super(data);
  }
}
```

- Find all `users` that have access to `organizations` with `bleco` in their name:

```ts
const userQuery = new ObjectQuery(userRepository);

const users = await userQuery.find({
  where: {
    'orgs.name': {
      like: '%bleco%',
    },
  },
});
```

- Find all `users` that have access to `projects` with `bleco` in their name:

```ts
const userQuery = new ObjectQuery(userRepository);

const users = await userQuery.find({
  where: {
    'orgs.projs.title': {
      like: '%bleco%',
    },
  },
});
```

## Thanks

- [knex-filter-loopback](https://github.com/joostvunderink/knex-filter-loopback): Declarative filtering for `knex.js`
  based on the Loopback Where Filter.
- [loopback-connector-postgresql](https://github.com/Wikodit/loopback-connector-postgresql): supports INNER JOIN only
  across one postgres datasource
- [loopback-connector-postgresql-include](https://github.com/Denys8/loopback-connector-postgresql-include): Resolving
  [Include filter](https://loopback.io/doc/en/lb4/Include-filter.html) with `left join`
