# @bleco/acl

> 一个 loopback next 4 授权管理组件

提供基于`资源`级别的授权管理

## 安装

NPM:

```bash
npm i @bleco/acl
```

Yarn:

```bash
yarn add @bleco/acl
```

## ACL Mixins

`@bleco/acl` 为应用提供了一个 mixin，在 App 上自动绑定 `Policy` 管理方法。组件声明的 `Policy` 也会自动绑定。

`Policy` 绑定到 `policies.${ModelName}` 并添加到 `Application.policyRegistry`. 例如：

```ts
import {Application} from '@loopback/core';
import {AclMixin} from '@bleco/acl';
import {AccountPolicy, CategoryPolicy} from './policies';

// Using the Mixin
class MyApplication extends AclMixin(Application) {}

const app = new MyApplication();
// AccountPolicy will be bound to key `policies.Account` and added into `PolicyRegistry`
app.policy(AccountPolicy);
// CategoryPolicy will be bound to key `policies.Category` and added into `PolicyRegistry`
app.policy(CategoryPolicy);
```

## 定义 Policy

`Policy` 定义为一个常规 JavaScript 对象，建议按如下格式定义：

```ts
// org.policy.ts

import {Polic} from '@bleco/acl';
import {Org} from '../models';

// Define resource roles
export const OrgRoles = {
  owner: 'owner',
  member: 'member',
} as const;

// Define resource role type
export type OrgRole = typeof OrgRoles[keyof typeof OrgRoles];

// Define resource actions
export const OrgActions = {
  read: 'read',
  create_repos: 'create_repos',
  list_repos: 'list_repos',
  create_role_assignments: 'create_role_assignments',
  list_role_assignments: 'list_role_assignments',
  update_role_assignments: 'update_role_assignments',
  delete_role_assignments: 'delete_role_assignments',
} as const;

// Define resource action type
export type OrgAction = typeof OrgActions[keyof typeof OrgActions];

// Define a resource policy
export const OrgPolicy: Policy<OrgRole, OrgAction> = {
  type: 'resource',
  model: Org,
  roles: ['owner', 'member'],
  actions: [
    'read',
    'create_repos',
    'list_repos',
    'create_role_assignments',
    'list_role_assignments',
    'update_role_assignments',
    'delete_role_assignments',
  ],
  roleActions: {
    owner: ['create_repos', 'create_role_assignments', 'update_role_assignments', 'delete_role_assignments'],
    member: ['read', 'list_repos', 'list_role_assignments'],
  },
  roleDerivations: {
    // `owner` inherits all actions from `member`.
    member: ['owner'],
  },
};
```

## 资源级鉴权

当前用户是否允许对某个资源执行某个操作？这是“资源级”执法的核心问题。

- 用户可以更新此组织的设置吗？
- 用户可以阅读此存储库吗？
- 管理员可以为此用户重新发送密码重置电子邮件吗？

资源级鉴权是应用授权的基础。如果在应用程序中只采用一种鉴权，就应该是这个。应用中的几乎每个接口都应该执行某种资源级别的鉴
权。

### 鉴权操作

用于资源级鉴权的方法称为 `acl.authorize`。使用此方法来确保用户有权对特定资源执行特定操作。`authorize` 方法接受三个参数
，`user`、`action`和`resource`。当动作被允许时它不返回任何东西，但在不允许时抛出[错误](#授权失败)。如果只是希望检查是否
有某种执行权限，而不希望抛出错误，可以使用 `acl.isAllowed` 方法，参数和 `authorize` 方法一样，只不过它返回的是布尔值。

Check with `acl.authorize`

```ts
import {Acl, AclBindings} from '@bleco/acl';

class MyClass {
  constructor(@inject(AclBindings.ACL) private acl: ACL) {}

  async approveExpense(user: User, expenseId: string) {
    const expense = await Expense.findById(expenseId);
    // or if  auhtorization only needs id and class information, we can create a resource instance
    // const expense = new Expense({id: expenseId});
    await this.acl.authorize(user, ExpenseActions.approve, expenseId);
    // ...
  }
}
```

Check with `acl.isAllowed`

```ts
import {Acl, AclBindings} from '@bleco/acl';

class MyClass {
  constructor(@inject(AclBindings.ACL) private acl: ACL) {}

  async approveExpense(user: User, expenseId: string) {
    const expense = await Expense.findById(expenseId);
    // or if  auhtorization only needs id and class information, we can create a resource instance
    // const expense = new Expense({id: expenseId});
    if (await this.acl.isAllowed(user, ExpenseActions.approve, expenseId)) {
      // ...
    } else {
      throw new Error('Not allowed to approve expense');
    }
  }
}
```

### 授权失败

根据规则，如果用户没有对资源执行操作的权限，`authorize` 方法会抛出 `AuthorizationError`。实际上有两种类型的授权错误 ，视
情况而定：

- `NotFoundError`：适用于用户不应该知道特定资源是否存在的情况，也就是说，用户对资源没有 `read` 权限。应用应该通过向用户
  显示 `404 "Not Found"` 错误来处理。
- `ForbiddenError`: 当用户知道资源存在时（即当他们有权访问 `read` 该资源时）会引发该错误，但不允许他们执行给定的操作。应
  用应该通过向用户显示 `403 "Forbidden"`错误来处理。

```
注意：使用 `authorize` 检查 `read` 操作永远不会引发 `ForbiddenError` 错误，只会引发 `NotFoundError` 错误 —— 如果不允许用户读取资源，服务应该表现得好像它不存在一样。
```

## `@loopback/authorization` 集成 - 作为官方`authorization`授权插件

`@bleco/acl` 实现了一个 [Authorizer](https://loopback.io/doc/en/lb4/Authorization-component-authorizer.html) 组件，用于
在 [@authorize](https://loopback.io/doc/en/lb4/Authorization-component-decorator.html) 中集成 `@bleco/acl` 进行授权检查
。

为了便于 [@authorize](https://loopback.io/doc/en/lb4/Authorization-component-decorator.html) 中提供 `@bleco/acl` 所需参
数，`@bleco/acl` 提供了一个便捷地装饰器：

```ts
import {acls} from '@bleco/acl';

export class MyController {
  @acls.authorize(OrgActions.read, Org, 0)
  async myMethod(
    @param.path.string('id')
    orgId: string,
    // ... other parameters
  ) {}

  @acls.authorize(SiteActions.create_orgs, DefaultSite)
  async create(org: Partial<Org>) {}
}
```

### 实现一个 `PrincipalResolver`

PrincipalResolver 用于为 `@acls.authorize(...)` 提供已登陆用户实例(创建或者从数据库加载用户实例），而不只是相关属性集合
，例如：`interface UserProfile {...}`。

```ts
export class PrincipalResolverProvider implements Provider<PrincipalResolver<User>> {
  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  value(): PrincipalResolver<User> {
    return invocationCtx => this.resolve(invocationCtx);
  }

  async resolve(invocationCtx: InvocationContext): Promise<User | undefined> {
    const profile = await invocationCtx.get<UserProfile>(SecurityBindings.USER);
    return new User({[User.getIdProperties()[0]]: profile[securityId], ...profile});
  }
}
```

### `@acls.authorize(...)`

`@acls.authorize(...)` 是一个装饰器，用于检查用户是否有权限执行某个操作。

```ts
export namespace acls {
  /**
   * Decorator `@authorize` to mark methods that require authorization
   *
   * @param actions The actions to be authorized
   * @param resource The resource instance to be authorized
   */
  export declare function authorize(actions: string | string[], resource: Entity): any;
  /**
   * Decorator `@authorize` to mark methods that require authorization
   *
   * @param actions The actions to be authorized
   * @param resource The resource class to be authorized
   * @param [idArgsIndex] The index of the arguments that contains the resource id. Default is 0.
   */
  export declare function authorize(
    actions: string | string[],
    resource: typeof Entity | Entity,
    idArgsIndex?: number,
  ): any;
}
```

## 全局角色

`@bleco/alc` 没有全局角色，但我们可以通过资源级权限模型来构建全局角色。

### 定义和初始化全局资源

- 定义一个 [Site](src/test/fixtures/components/gitclub/models/site.model.ts) 模型(可以是其他模型名称，比如: `System`)
- 定义一个 Site [Repository](src/test/fixtures/components/gitclub/repositories/site.repository.ts)
- 定义一个 Site [Policy](src/test/fixtures/components/gitclub/policies/site.policy.ts)
- App 启动时，或者初始化系统原始数据时来添加一条 `DefaultSite` 数据库记录。
  ```ts
  // create DefaultSite if not exists
  if (!(await siteRepo.findOne({where: {id: DefaultSite.id}}))) {
    await siteRepo.create(DefaultSite);
  }
  ```

### 使用全局角色

- 将全局角色授予某个用户

  ```ts
  await roleMappingService.add(someUser, SiteRoles.admin, DefaultSite);
  // or working is domain
  await roleMappingService.add(someUser, SiteRoles.admin, DefaultSite, CurrentDomain);
  ```

- 鉴权

  ```ts
  await acl.authorize(someUser, SiteActions.create_orgs, DefaultSite);
  // or
  await acl.isAllowed(someUser, SiteActions.create_orgs, DefaultSite);
  ```

- 角色派生

  在其子资源中，应用全局的角色。比如：全局管理员可以操作管理其所有子资源。

  - 在模型中定义关联关系

    ```ts
    import {belongsTo} from '@loopback/repository';

    @model()
    export class Org extends Entity {
      //...

      @belongsTo(() => Site)
      siteId: Site;

      //...
    }
    ```

  - 在 Policy 中设定角色派生规则
    ```ts
    export const OrgPolicy: Policy<OrgRole, OrgAction> = {
      type: 'resource',
      model: Org,
      roles: ['owner', 'member'],
      // 指定父级关系
      relations: ['site'],
      actions: [
        'read',
        'create_repos',
        'list_repos',
        'create_role_assignments',
        'list_role_assignments',
        'update_role_assignments',
        'delete_role_assignments',
      ],
      roleActions: {
        owner: ['create_repos', 'create_role_assignments', 'update_role_assignments', 'delete_role_assignments'],
        member: ['read', 'list_repos', 'list_role_assignments'],
      },
      roleDerivations: {
        member: ['owner'],
        // 从资源 owner 角色派生到 Site 的管理员角色，即赋予全局管理员对所有 Org 拥有等同于 Org ower 角色的权限
        owner: ['site.admin'],
      },
    };
    ```

## 多租户（试验）

### 鉴权

[Enforcer](src/enforcer.ts) 尚未提供基于多租户的鉴权查询条件，但我们可以通过如下方式来实现：

- 基于资源模型的鉴权，都需要预先指定资源`id`，如果资源`id`是多租户全局唯一的话，鉴权时无需指定租户。
- `acl.authorizedQuery()` 返回过滤条件中，不含租户约束，我们可以在应用层添加即可：

  ```ts
  const query = await acl.authorizedQuery(someUser, OrgActions.read, Org);
  const orgs = await orgRepo.find({where: {and: [query.where, {tenantId: CurrentTenant.id}]}});
  ```

## APIs

### Enforcer

[Enforcer](src/enforcer.ts) 用于检查用户是否有权限执行某个操作。

### AclRoleMappingService

[AclRoleMappingService](src/services/acl-role-mapping.service.ts) 用于管理配置角色映射关系。

### AclRoleService

[AclRoleService](src/services/acl-role.service.ts) 用于管理自定义角色。

### AclRoleMappingRepository

[AclRoleMappingRepository](src/repositories/acl-role-mapping.repository.ts) 角色映射关系 Repository。

### AclRoleRepository

[AclRoleRepository](src/repositories/acl-role.repository.ts) 自定义角色 Repository。
