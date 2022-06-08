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
            _: ['admin'],
            org: ['owner'],
          },
          read: {
            _: ['reader', 'admin', 'maintainer'],
            org: ['owner', 'member'],
          },
        },
        roleChildren: {
          admin: {
            _: [],
            org: ['owner'],
          },
          maintainer: {
            _: ['admin'],
            org: ['owner'],
          },
          reader: {
            _: ['admin', 'maintainer'],
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
            _: ['creator'],
            repo: ['maintainer'],
          },
          read: {
            _: [],
            repo: ['reader'],
          },
        },
        roleChildren: {
          creator: {
            _: [],
          },
        },
        roleParents: {
          creator: [],
        },
      });
    });
  });
});
