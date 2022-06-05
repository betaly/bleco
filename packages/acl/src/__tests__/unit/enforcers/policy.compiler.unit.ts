import {compile} from '../../../enforcers/default';
import {Issue, Repo} from '../../../test';
import {IssuePolicy, RepoPolicy} from '../../fixtures/policies';

describe('Policy Compiler', function () {
  describe('resolvePolicy', function () {
    it('should resolve policy with role derivations', function () {
      const resolved = compile(RepoPolicy);
      expect(resolved).toEqual({
        model: Repo,
        definition: RepoPolicy,
        actions: ['read', 'manage'],
        actionRoles: {
          manage: {
            $: ['admin'],
            org: ['owner'],
          },
          read: {
            $: ['reader', 'admin', 'maintainer'],
            org: ['owner', 'member'],
          },
        },
        roleChildren: {
          admin: {
            $: [],
            org: ['owner'],
          },
          maintainer: {
            $: ['admin'],
            org: ['owner'],
          },
          reader: {
            $: ['admin', 'maintainer'],
            org: ['owner', 'member'],
          },
        },
        roleParents: {
          admin: ['maintainer', 'reader'],
          maintainer: ['reader'],
          'org.member': ['reader'],
          'org.owner': ['admin', 'maintainer', 'reader'],
          reader: [],
        },
      });
    });

    it('should resolve policy with relative role permissions', function () {
      const resolved = compile(IssuePolicy);
      expect(resolved).toEqual({
        model: Issue,
        definition: IssuePolicy,
        actions: ['read', 'close'],
        actionRoles: {
          close: {
            $: ['creator'],
            repo: ['maintainer'],
          },
          read: {
            $: [],
            repo: ['reader'],
          },
        },
        roleChildren: {
          creator: {
            $: [],
          },
        },
        roleParents: {
          creator: [],
        },
      });
    });
  });
});
