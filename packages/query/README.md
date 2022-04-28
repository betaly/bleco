# @bleco/query

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

## Install

npm:

```shell
npm install @bleco/query
```

Yarn:

```shell
yarn add @bleco/query
```

## getting Started

```ts
import {SqlQuery} from '@bleco/query';
import {typequery} from './decorators';
import repository = typequery.repository;

class SomeClass {
  query: SqlQuery<SomeEntity>;

  constructor(
    @repository(OrgRepository)
    public orgRepository: OrgRepository,
  ) {
    this.query = new SqlQuery(this.orgRepository);
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

## SqlQuery

A querier that performs model filtering queries through relational cascading conditions.

### use

#### Construct

- `new SqlQuery(repository)`: Through the `new SqlQuery(repository)` construct, a Repository instance is passed in,
  which supports include.
- `new SqlQuery(entityClass, repository)`: Constructed by `new SqlQuery(entityClass, repository)`, passing in a model
  class and a Repository instance, does not support include.

#### `SqlQueryRepositoryMixin` inheritance

Mixed into Repository via `SqlQueryRepositoryMixin` to extend seamless cascading query support to native `find` and
`findOne`. (Note: not supported [access](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) for `find` and
`findOne` and [loaded](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) event)

method:

```ts
declare function SqlQueryRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
>(superClass: R, options: boolean | QueryMixinOptions = {});
```

parameter:

- `superClass`: the inherited class
- `options: boolean | QueryMixinOptions`: mixin options
  - `overrideCruds`: whether to override native CRUD methods, the default is `false`

```ts
export class FooRepository
  extends SqlQueryRepositoryMixin<
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

#### `mixinQuery` decorator

method:

```ts
declare function mixinQuery(options: boolean | QueryMixinOptions = false);
```

parameter:

- `options: boolean | QueryMixinOptions`: mixin options
  - `overrideCruds`: whether to override native CRUD methods, the default is `false`

```ts
@mixinQuery(true)
export class FooRepositoryWithQueryDecorated extends DefaultCrudRepository<Foo, typeof Foo.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

export interface FooRepositoryWithQueryDecorated extends QueryRepository<Foo> {}
```

#### `DefaultCrudRepositoryWithQuery` that inherits from `DefaultCrudRepository` and implements `mixinQuery`

`DefaultCrudRepository` is the default CRUD interface implementation of `loopback`, which has all the functions of the
CRUD interface. Most business repositories inherit from it.

Here we provide a method that inherits from `DefaultCrudRepository` and implements `mixinQuery`
`DefaultCrudRepositoryWithQuery` replacement class, with `Query` replacing the `find`, `findOne` and `count` native
queries. For data sources that are not yet supported (eg: non-relational database), which will be passed directly to the
native query.

#### Patching

For historical projects, it is not convenient to use Mixin or inheritance for refactoring. Therefore, we provide a
Patching scheme that can be initialized in the application, not yet `patching` the `DefaultCrudRepository` before
loading.

```ts
import {queryPatch} from '@bleco/query';
import {DefaultCrudRepository} from '@loopback/repository';

export async function main(options: ApplicationConfig = {}) {
  // patching `DefaultCrudRepository`
  queryPatch(DefaultCrudRepository);

  const app = new TodoListApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  return app;
}
```

##### `queryPatch(repoClass)`: Patching a `Repository` class or instance

```ts
// patching a repository class
queryPatch(DefaultCrudRepository);

// patching a repository instance
queryPatch(repository);

// or patching self
class MyRepository extends DefaultCrudRepository<MyModel, typeof MyModel.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(MyModel, dataSource);
    queryPatch(this);
  }
}
```

#### Query API

- `find(filter?: QueryFilter<M>, options?): Promise<(M & Relations)[]>`: According to the specified filter, find all
  There are model instances
- `findOne(filter?: QueryFilter<M>, options?): Promise<(M & Relations) | null>`: according to the specified filter , to
  find the first model instance
- `count(filter?: QueryFilter<M>, options?): Promise<{count: numer}>`: According to the specified filter, the
  statistical model number of instances

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
const userQuery = new SqlQuery(userRepository);

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
const userQuery = new SqlQuery(userRepository);

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
