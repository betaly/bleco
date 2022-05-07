import {PolarResource} from '../../../../polar';

export const resource: PolarResource = {
  name: 'Repo',
  roles: ['admin', 'maintainer', 'reader'],
  relations: {parent: {model: 'Org', property: 'org'}},
  permissions: [
    'read',
    'create_issues',
    'list_issues',
    'create_role_assignments',
    'list_role_assignments',
    'update_role_assignments',
    'delete_role_assignments',
  ],
  rolePermissions: {
    admin: ['create_role_assignments', 'list_role_assignments', 'update_role_assignments', 'delete_role_assignments'],
    reader: ['read', 'list_repos', 'list_role_assignments'],
  },
  roleInherits: {
    'owner@parent': ['admin'],
    'member@parent': ['reader'],
    admin: ['maintainer'],
    maintainer: ['reader'],
  },
};

export const script = `resource Repo {
\troles = ["admin", "maintainer", "reader"];
\tpermissions = ["read", "create_issues", "list_issues", "create_role_assignments", "list_role_assignments", "update_role_assignments", "delete_role_assignments"];
\trelations = {parent: Org};
\t"create_role_assignments" if "admin";
\t"list_role_assignments" if "admin";
\t"update_role_assignments" if "admin";
\t"delete_role_assignments" if "admin";
\t"read" if "reader";
\t"list_repos" if "reader";
\t"list_role_assignments" if "reader";
\t"admin" if "owner" on "parent";
\t"reader" if "member" on "parent";
\t"maintainer" if "admin";
\t"reader" if "maintainer";
}
has_relation(org: Org, "parent", _: Repo{org: org});
`;
