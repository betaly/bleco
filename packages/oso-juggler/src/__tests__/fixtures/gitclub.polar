actor User {}

resource Org {
  roles = ["owner", "member"];
  permissions = [
    "read",
    "create_repos",
    "list_repos",
    "create_role_assignments",
    "list_role_assignments",
    "update_role_assignments",
    "delete_role_assignments",
  ];

  "read" if "member";
  "list_repos" if "member";
  "list_role_assignments" if "member";

  "create_repos" if "owner";
  "create_role_assignments" if "owner";
  "update_role_assignments" if "owner";
  "delete_role_assignments" if "owner";

  "member" if "owner";
}

resource Repo {
  roles = ["admin", "writer", "reader"];
  permissions = [
    "read",
    "create_issues",
    "list_issues",
    "create_role_assignments",
    "list_role_assignments",
    "update_role_assignments",
    "delete_role_assignments",
  ];
  relations = { parent: Org };

  "create_role_assignments" if "admin";
  "list_role_assignments" if "admin";
  "update_role_assignments" if "admin";
  "delete_role_assignments" if "admin";

  "create_issues" if "writer";

  "read" if "reader";
  "list_issues" if "reader";

  "admin" if "owner" on "parent";
  "reader" if "member" on "parent";

  "writer" if "admin";
  "reader" if "writer";
}

resource Issue {
  permissions = ["read"];
  relations = { parent: Repo };

  "read" if "reader" on "parent";
}

allow(actor, action, resource) if
  has_permission(actor, action, resource);

# Users can see each other.
has_permission(_: User, "read", _: User);

# A User can read their own profile.
has_permission(user: User, "read_profile", user: User);

# Any logged-in user can create a new org.
has_permission(_: User, "create", _: Org);

has_role(user: User, name: String, org: Org) if
    role in user.orgRoles and
    role matches { name: name, org: org };

has_role(user: User, name: String, repo: Repo) if
    role in user.repoRoles and
    role matches { name: name, repo: repo };

has_relation(org: Org, "parent", _: Repo{org: org});
has_relation(repo: Repo, "parent", _: Issue{repo: repo});
