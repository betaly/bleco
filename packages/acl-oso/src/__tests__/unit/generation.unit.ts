import {Repo} from '@bleco/acl/dist/test';
import {PolarGeneration} from '../../polar';

describe('generation', function () {
  describe('generate', function () {
    it('should generate with writer', async () => {
      const result = await PolarGeneration.generate(writer => {
        writer.write('Hello, ');
        writer.write('world!');
      });
      expect(result).toBe('Hello, world!');
    });
  });

  describe('generate polar script', function () {
    it('should generateResourceScripts', async () => {
      const result = await PolarGeneration.generate(writer => {
        PolarGeneration.generateResourceScripts(writer, {
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
      expect(result).toMatchSnapshot();
    });
  });
});
