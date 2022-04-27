# @bleco/sqlquery

> 一个基于 [Kenx](https://knexjs.org/) 支持 INNER JOIN 的 loopback-next sql 查询器

## 功能

- 支持级联过滤查询(通过类如 `{where: {'relation_ab.relation_bc.relation_cd.property': 'value'}}` 的 `where` 子句方式)
- 完全兼容 loopback-next 的 Where Filter
- 支持 [hasMany](https://loopback.io/doc/en/lb4/HasMany-relation.html),
  [belongsTo](https://loopback.io/doc/en/lb4/BelongsTo-relation.html),
  [hasOne](https://loopback.io/doc/en/lb4/HasOne-relation.html) 和
  [hasManyThrough](https://loopback.io/doc/en/lb4/HasManyThrough-relation.html) 关系
- 支持 `PostgreSQL`, `MSSQL`, `MySQL`, `MariaDB`, `SQLite3`, `Oracle` 关系型数据库，其他数据库，通过 Mixin 方式扩展的
  Repository 将委托给父类的原生查询方法。
- 不支持通过 `find` 和 `findOne` 加载对象的 [access](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) 和
  [loaded](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) 事件。

## 安装

NPM:

```shell
npm install @bleco/sqlquery
```

Yarn:

```shell
yarn add @bleco/sqlquery
```

## 入门

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
        // 通过 projects 的 name 条件，级联查询 Org。但结果并不包含关联对象 projects。如需包含关联对象，可以使用 include 方法。
        'projects.name': 'bleco',
        age: {
          gt: 10,
          lt: 20,
        },
      },
      include: [
        // 包含关联对象 projects
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

通过关系级联条件，进行模型筛选查询的查询器。

### 使用

#### 构造

- `new ObjectQuery(repository)`: 通过 `new ObjectQuery(repository)` 构造，传入一个 Repository 实例, 可支持 include。
- `new ObjectQuery(entityClass, repository)`: 通过 `new ObjectQuery(entityClass, repository)` 构造，传入一个模型类和一个
  Repository 实例, 不支持 include。

#### `ObjectQueryRepositoryMixin` 继承

通过 `ObjectQueryRepositoryMixin` 混入 Repository, 对原生 `find` 和 `findOne` 进行无缝级联查询支持扩展。(注意：不支持
`find` 和 `findOne` 的 [access](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) 和
[loaded](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) 事件)

方法:

```ts
declare function ObjectQueryRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
>(superClass: R, mixinOptions: boolean | ObjectQueryMixinOptions = {});
```

参数：

- `superClass`: 继承的类
- `mixinOptions: boolean | ObjectQueryMixinOptions`: 混入选项
  - `overrideCruds`: 是否覆盖原生 CRUD 方法，默认为 `false`

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

#### `mixinObjectQuery` 装饰器

方法:

```ts
declare function mixinObjectQuery(mixinOptions: boolean | ObjectQueryMixinOptions = false);
```

参数：

- `superClass`: 继承的类
- `mixinOptions: boolean | ObjectQueryMixinOptions`: 混入选项
  - `overrideCruds`: 是否覆盖原生 CRUD 方法，默认为 `false`

```ts
@mixinObjectQuery(true)
export class FooRepositoryWithObjectQueryDecorated extends DefaultCrudRepository<Foo, typeof Foo.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

export interface FooRepositoryWithObjectQueryDecorated extends ObjectQueryRepository<Foo> {}
```

通过 `ObjectQueryRepositoryMixin` 或者 `mixinObjectQuery` 混入后的类，具备了 `ObjectQueryRepository` 的接口功能。

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

#### 继承自 `DefaultCrudRepository` 并进行了 `mixinObjectQuery` 的 `DefaultCrudRepositoryWithObjectQuery`

`DefaultCrudRepository` 是 `loopback` 的默认 CRUD 接口实现，具备了 CRUD 接口的所有功能。大多数的业务 Repository 都继承自
它。

我们在这里提供一个继承自 `DefaultCrudRepository`，并且进行了 `mixinObjectQuery` 的
`DefaultCrudRepositoryWithObjectQuery` 平替类，用 `ObjectQuery` 接替 `find`, `findOne` 和 `count` 原生查询。对于非关系型
数据库，将直接透传给原生查询。

#### Patching

对于历史项目，不太方便采用 Mixin 或者继承的方式，进行重构的。因此，我们提供了一个 Patching 方案，可以在应用初始化，尚未
加载之前，对 `DefaultCrudRepository` 进行 `patching`。

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

- `patchObjectQueryToRepositoryClass(repoClass)`: Patching 一个 `Repository` 类
  ```ts
  patchObjectQueryToRepositoryClass(DefaultCrudRepository);
  ```
- `patchObjectQueryToRepository(repo)`: Patching 一个 `Repository` 实例

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

- `ObjectQuery.prototype.find(filter?: QueryFilter<M>, options?): Promise<(M & Relations)[]>`: 根据指定的过滤器，查找所
  有模型实例
- `ObjectQuery.prototype.findOne(filter?: QueryFilter<M>, options?): Promise<(M & Relations) | null>`: 根据指定的过滤器
  ，查找第一个模型实例
- `ObjectQuery.prototype.count(filter?: QueryFilter<M>, options?): Promise<{count: numer}>`: 根据指定的过滤器，统计模型
  实例的数量

#### QueryFilter

兼容 loopback 原生 [Filter](https://loopback.io/doc/en/lb4/Querying-data.html#filters)。扩展支持级联路径作为 `where` 子
句查询条件。

```ts
export type QueryWhere<MT extends object = AnyObject> = Where<MT & Record<string, any>>;

export interface QueryFilter<MT extends object = AnyObject> extends Filter<MT> {
  where?: QueryWhere<MT>;
}
```

例如有如下模型：

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

- 查找所有可以访问名称中含有 `bleco` 的`组织`的`用户`：

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

- 查找所有可以访问名称中含有 `bleco` 的`项目`的`用户`：

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

## 感谢

- [knex-filter-loopback](https://github.com/joostvunderink/knex-filter-loopback): Declarative filtering for `knex.js`
  based on the Loopback Where Filter.
- [loopback-connector-postgresql](https://github.com/Wikodit/loopback-connector-postgresql): supports INNER JOIN only
  across one postgres datasource
- [loopback-connector-postgresql-include](https://github.com/Denys8/loopback-connector-postgresql-include): Resolving
  [Include filter](https://loopback.io/doc/en/lb4/Include-filter.html) with `left join`
