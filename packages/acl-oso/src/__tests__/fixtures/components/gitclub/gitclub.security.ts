import {OsoPolicy} from '../../../../types';
import {Org} from './models/org.model';
import {Repo} from './models/repo.model';
import {Issue} from './models/issue.model';

export const policy: OsoPolicy = {
  resources: {
    [Org.name]: {
      roles: ['owner', 'member'],
      permissions: [
        'read',
        'create_repos',
        'list_repos',
        'create_role_assignments',
        'list_role_assignments',
        'update_role_assignments',
        'delete_role_assignments',
      ],
      rolePermissions: {
        owner: ['create_repos', 'create_role_assignments', 'update_role_assignments', 'delete_role_assignments'],
        member: ['read', 'list_repos', 'list_role_assignments'],
      },
      roleInherits: {
        owner: ['member'],
      },
    },
    [Repo.name]: {
      roles: ['admin', 'maintainer', 'reader'],
      relations: {org: 'Org'},
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
        admin: [
          'create_role_assignments',
          'list_role_assignments',
          'update_role_assignments',
          'delete_role_assignments',
        ],
        reader: ['read', 'list_issues', 'create_issues'],
      },
      roleInherits: {
        'owner@org': ['admin'],
        'member@org': ['reader'],
        admin: ['maintainer'],
        maintainer: ['reader'],
      },
    },
    [Issue.name]: {
      roles: ['creator'],
      permissions: ['read', 'close'],
      relations: {repo: 'Repo'},
      rolePermissions: {
        'reader@repo': ['read'],
        'maintainer@repo': ['close'],
        creator: ['close'],
      },
    },
  },
};
