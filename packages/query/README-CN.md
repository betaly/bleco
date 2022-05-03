# @bleco/query

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
npm install @bleco/query
```

Yarn:

```shell
yarn add @bleco/query
```

## 入门

```ts
import {Query, DefaultQuery} from '@bleco/query';
import {typequery} from './decorators';

class SomeClass {
  query: Query<SomeEntity>;

  constructor(
    @repository(OrgRepository)
    public orgRepository: OrgRepository,
  ) {
    this.query = new DefaultQuery(this.orgRepository);
  }

  async findSomeEntity() {
    return this.query.find({
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

## DefaultQuery

通过关系级联条件，进行模型筛选查询的查询器。

### 使用

#### 构造

通过一个 Repository 实例参数构造 DefaultQuery, 借助
[repository inclusion resolvers](https://loopback.io/doc/en/lb4/Relations.html) 支持 include 子句

```ts
new DefaultQuery(repository);
```

通过一个模型类和一个 datasource 实例参数构造 DefaultQuery, 不支持 include 子句

```ts
new DefaultQuery(entityClass, datasource);
```

#### `QueryRepositoryMixin` 继承

通过 `QueryRepositoryMixin` 混入 Repository, 对原生 `find` 和 `findOne` 进行无缝级联查询支持扩展。(注意：不支持 `find`
和 `findOne` 的 [access](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) 和
[loaded](https://loopback.io/doc/en/lb3/Operation-hooks.html#access) 事件)

语法:

```ts
declare function QueryRepositoryMixin<
  M extends Entity,
  ID,
  Relations extends object,
  R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
>(superClass: R, options: boolean | QueryMixinOptions = {});
```

参数：

- `superClass`: 继承的类
- `options: boolean | QueryMixinOptions`: 混入选项
  - `overrideCruds`: 是否覆盖原生 CRUD 方法，默认为 `false`

```ts
export class FooRepository
  extends QueryRepositoryMixin<
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

#### `@mixinQuery` 装饰器

方法:

`@mixinQuery(options: boolean | QueryMixinOptions = false)`

参数：

- `options: boolean | QueryMixinOptions`: 混入选项
  - `overrideCruds`: 是否覆盖原生 CRUD 方法，默认为 `false`

```ts
@mixinQuery(true)
export class FooRepositoryWithQueryDecorated extends DefaultCrudRepository<Foo, typeof Foo.prototype.id> {
  constructor(dataSource: juggler.DataSource) {
    super(Foo, dataSource);
  }
}

export interface FooRepositoryWithQueryDecorated extends QueryRepository<Foo> {}
```

#### `@query` 装饰器

方法:

`@query(modelOrRepo: string | Class<Repository<Model>> | typeof Entity, dataSource?: string | juggler.DataSource)`

`@query` 装饰器通过注入一个现有 `repository` 实例，或者从一个 `model` 和 `datasource` 创建一个新的 `query` 实例。

在一个 `controller` 中创建一个 `query` 实例，可以先定义 `model` 和 `datasource`，然后导入到 `controller` 中， 并使用
`@query` 注入

```ts
import {query, Query} from '@bleco/query';
import {repository} from '@loopback/repository';
import {Todo} from '../models';
import {db} from '../datasources/db.datasource';

export class TodoController {
  @query(Todo, db)
  todoQuery: Query<Todo>;
  // ...
}
```

如果 `model` 或者 `datasource` 已经绑定到 `app`，可以把他们的名字直接传入 `@query` 注入器来创建，如下：

```ts
// with `db` and `Todo` already defined.
app.bind('datasources.db').to(db);
app.bind('models.Todo').to(Todo);

export class TodoController {
  @query('Todo', 'db')
  todoQuery: Query<Todo>;
  // etc
}
```

#### 继承自 `DefaultCrudRepository` 并进行了 `mixinQuery` 的 `DefaultCrudRepositoryWithQuery`

`DefaultCrudRepository` 是 `loopback` 的默认 CRUD 接口实现，具备了 CRUD 接口的所有功能。大多数的业务 Repository 都继承自
它。

我们在这里提供一个继承自 `DefaultCrudRepository`，并且进行了 `mixinQuery` 的 `DefaultCrudRepositoryWithQuery` 替换类，用
`Query` 接替 `find`, `findOne` 和 `count` 原生查询。对于尚未支持的数据源（如：非关系型数据库），将直接透传给原生查询。

#### Patching

对于历史项目，不太方便采用 Mixin 或者继承的方式，进行重构的。因此，我们提供了一个 Patching 方案，可以在应用初始化，尚未
加载之前，对 `DefaultCrudRepository` 进行 `patching`。

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

##### `queryPatch(repoClass)`: Patching 一个 `Repository` 类或者实例

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

```ts
export interface Query<T extends Entity, Relations extends object = {}> {
  entityClass: EntityClass<T>;

  /**
   * Find matching records
   *
   * @param filter - Query filter
   * @param options - Options for the operations
   * @returns A promise of an array of records found
   */
  find(filter?: QueryFilter<T>, options?: Options): Promise<(T & Relations)[]>;

  /**
   * Find one record that matches filter specification. Same as find, but limited to one result; Returns object, not collection.
   *
   * @param filter - Query filter
   * @param options - Options for the operations
   * @returns A promise of a record found
   */
  findOne(filter?: QueryFilter<T>, options?: Options): Promise<(T & Relations) | null>;

  /**
   * Count matching records
   * @param where - Matching criteria
   * @param options - Options for the operations
   * @returns A promise of number of records matched
   */
  count(where?: QueryWhere<T>, options?: Options): Promise<{count: number}>;
}
```

#### QueryFilter

兼容 loopback 原生 [Filter](https://loopback.io/doc/en/lb4/Querying-data.html#filters)。扩展支持级联路径作为 `where` 子
句查询条件。 ``

- 用关系和字段为 `key` 进行关联查询（使用 `INNER JOIN`）
  ```js
  {
    where: {
      'relation_a.relation_b.property': value
    }
  }
  ```
- 用 `$rel` 进行关联查询（使用 `INNER JOIN`）
  ```js
  {
    where: {
      $rel: 'relation_a.relation_b';
    }
  }
  // 或者同时定义多个关系
  {
    where: {
      $rel: ['relation_a.relation_b', 'relation_c.relation_d'];
    }
  }
  ```
- 用 `$expr` 进行字段间的过滤查询
  - 值 <-> 值：
    ```js
    {
      where: {
        $expr: {
          eq: [1, 0];
        }
      }
    }
    ```
  - 字段 <-> 值：
    ```js
    {
      where: {
        $expr: {
          eq: ['$relation_a.relation_b.property', value];
        }
      }
    }
    ```
  - 值 <-> 字段：
    ```js
    {
      where: {
        $expr: {
          eq: [值, '$relation_a.relation_b.property'];
        }
      }
    }
    ```
  - 字段 <-> 字段：
    ```js
    {
      where: {
        $expr: {
          eq: ['$relation_a.relation_b.property', '$relation_c.relation_d.property'];
        }
      }
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
const userQuery = new DefaultQuery(userRepository);

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
const userQuery = new DefaultQuery(userRepository);

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
