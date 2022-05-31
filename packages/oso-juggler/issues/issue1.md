多个关系路径指向同一个目标表时，oso conditions 中无法区分关联路径，从而无法正确的构建查询条件

- OSO initialization:

```ts
import oso from 'oso';

oso.registerClass(RoleMapping, {
  fields: {
    princopalType: String,
    princopalId: String,
    resourceType: String,
    resourceId: String,
    roleId: String,
  },
});

oso.registerClass(Org, {
  fields: {
    principals: new Relation('many', 'RoleMapping', 'id', 'resourceId'),
  },
});

oso.registerClass(Repo, {
  fields: {
    principals: new Relation('many', 'RoleMapping', 'id', 'resourceId'),
    org: new Relation('one', 'Org', 'orgId', 'id'),
  },
});
```

- The polar file

```polar
allow(principal, action, resource) if has_permission(principal, action, resource);
actor User {
}
resource Org {
	roles = ["owner", "member"];
	permissions = ["read", "create_repos", "list_repos", "create_role_assignments", "list_role_assignments", "update_role_assignments", "delete_role_assignments"];
	"create_repos" if "owner";
	"create_role_assignments" if "owner";
	"update_role_assignments" if "owner";
	"delete_role_assignments" if "owner";
	"read" if "member";
	"list_repos" if "member";
	"list_role_assignments" if "member";
	"member" if "owner";
}

has_role(actor: Actor, name: String, org: Org) if
  mapping in org.principals and
  mapping matches {principalId: actor.id, roleId: name};

resource Repo {
	roles = ["admin", "maintainer", "reader"];
	permissions = ["read", "create_issues", "list_issues", "create_role_assignments", "list_role_assignments", "update_role_assignments", "delete_role_assignments"];
	relations = {org: Org};
	"create_role_assignments" if "admin";
	"list_role_assignments" if "admin";
	"update_role_assignments" if "admin";
	"delete_role_assignments" if "admin";
	"read" if "reader";
	"list_issues" if "reader";
	"create_issues" if "reader";
	"admin" if "owner" on "org";
	"reader" if "member" on "org";
	"maintainer" if "admin";
	"reader" if "maintainer";
}
has_relation(org: Org, "org", _: Repo{org: org});

has_role(actor: Actor, name: String, repo: Repo) if
  mapping in repo.principals and
  mapping matches {principalId: actor.id, roleId: name};
```

- fetch the `authorizedQuery`

```ts
const query = oso.authorizedQuery(user, 'read', Repo);
```

The filter from adapter:

```json5
{
  model: 'Repo',
  conditions: [
    [
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'roleId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'reader',
        },
      },
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'principalId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'xxnWbj4Ok',
        },
      },
    ],
    [
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'roleId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'member',
        },
      },
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'principalId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'xxnWbj4Ok',
        },
      },
    ],
    [
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'principalId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'xxnWbj4Ok',
        },
      },
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'roleId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'owner',
        },
      },
    ],
    [
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'principalId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'xxnWbj4Ok',
        },
      },
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'roleId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'maintainer',
        },
      },
    ],
    [
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'principalId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'xxnWbj4Ok',
        },
      },
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'roleId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'admin',
        },
      },
    ],
    [
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'roleId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'owner',
        },
      },
      {
        lhs: {
          typeName: 'RoleMapping',
          fieldName: 'principalId',
        },
        cmp: 'Eq',
        rhs: {
          value: 'xxnWbj4Ok',
        },
      },
    ],
  ],
  relations: [
    {
      fromTypeName: 'Repo',
      fromFieldName: 'principals',
      toTypeName: 'RoleMapping',
    },
    {
      fromTypeName: 'Repo',
      fromFieldName: 'org',
      toTypeName: 'Org',
    },
    {
      fromTypeName: 'Org',
      fromFieldName: 'principals',
      toTypeName: 'RoleMapping',
    },
  ],
}
```
