import {generate, generateResourceScripts} from '../../generation';
import {Repo} from '../fixtures/components/gitclub/models/repo.model';

describe('generation', function () {
  describe('generate', function () {
    it('should generate with writer', async () => {
      const result = await generate(writer => {
        writer.write('Hello, ');
        writer.write('world!');
      });
      expect(result).toBe('Hello, world!');
    });
  });

  describe('generate polar script', function () {
    it('should generateResourceScripts', async () => {
      const result = await generate(writer => {
        generateResourceScripts(writer, {
          model: Repo,
          roles: ['admin', 'maintainer', 'reader'],
          relations: ['org'],
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
            'org.owner': ['admin'],
            'org.member': ['reader'],
            admin: ['maintainer'],
            maintainer: ['reader'],
          },
        });
      });
      // console.log(result);
      expect(result).toEqual(`resource Repo {
\troles = ["admin", "maintainer", "reader"];
\tpermissions = ["read", "create_issues", "list_issues", "create_role_assignments", "list_role_assignments", "update_role_assignments", "delete_role_assignments"];
\trelations = {org: Org};
\t"create_role_assignments" if "admin";
\t"list_role_assignments" if "admin";
\t"update_role_assignments" if "admin";
\t"delete_role_assignments" if "admin";
\t"read" if "reader";
\t"list_issues" if "reader";
\t"create_issues" if "reader";
\t"admin" if "owner" on "org";
\t"reader" if "member" on "org";
\t"maintainer" if "admin";
\t"reader" if "maintainer";
}
has_relation(org: Org, "org", _: Repo{org: org});
`);
    });
  });
});
