import {Policy, PolicyManager} from '../../policies';
import {Entity, model, property} from '@loopback/repository';
import {Role, RoleMapping} from '../../models';

@model()
class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;
}

@model()
class Org extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;
}

describe('PolicyManager', function () {
  describe('add', function () {
    it('should defineRolesRelationOnPrincipal', function () {
      const userPolicy: Policy = {
        type: 'principal',
        model: User,
      };

      const definition = User.definition;
      expect(definition.relations).not.toHaveProperty('roles');

      const policyManager = new PolicyManager();
      policyManager.add(userPolicy);
      expect(policyManager.has(User.name)).toBe(true);
      const rel = definition.relations['roles'];
      expect(rel).toBeTruthy();
      expect(rel.target()).toEqual(RoleMapping);
    });

    it('should defineRolesRelationOnResource', function () {
      const orgPolicy: Policy = {
        type: 'resource',
        model: Org,
      };
      const definition = Org.definition;
      expect(definition.relations).not.toHaveProperty('roles');
      expect(definition.relations).not.toHaveProperty('principals');

      const policyManager = new PolicyManager();
      policyManager.add(orgPolicy);
      expect(policyManager.has(Org.name)).toBe(true);
      let rel = definition.relations['roles'];
      expect(rel).toBeTruthy();
      expect(rel.target()).toEqual(Role);

      rel = definition.relations['principals'];
      expect(rel).toBeTruthy();
      expect(rel.target()).toEqual(RoleMapping);
    });
  });
});
