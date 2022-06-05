import {Entity, model, property} from '@loopback/repository';
import {AclRole, AclRoleMapping} from '../../models';
import {AclModelRelationKeys, Policy, PolicyRegistry} from '../../policies';
import PrincipalRoleMappings = AclModelRelationKeys.PrincipalRoleMappings;

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

describe('PolicyRegistry', function () {
  describe('add', function () {
    it('should defineRolesRelationOnPrincipal', function () {
      const userPolicy: Policy = {
        type: 'principal',
        model: User,
      };

      const definition = User.definition;
      expect(definition.relations).not.toHaveProperty(PrincipalRoleMappings);

      const registry = new PolicyRegistry();
      registry.add(userPolicy);
      expect(registry.has(User.name)).toBe(true);
      const rel = definition.relations[PrincipalRoleMappings];
      expect(rel).toBeTruthy();
      expect(rel.target()).toEqual(AclRoleMapping);
    });

    it('should defineRolesRelationOnResource', function () {
      const orgPolicy: Policy = {
        type: 'resource',
        model: Org,
      };
      const definition = Org.definition;
      expect(definition.relations).not.toHaveProperty('roles');
      expect(definition.relations).not.toHaveProperty('principals');

      const registry = new PolicyRegistry();
      registry.add(orgPolicy);
      expect(registry.has(Org.name)).toBe(true);
      let rel = definition.relations['roles'];
      expect(rel).toBeTruthy();
      expect(rel.target()).toEqual(AclRole);

      rel = definition.relations['principals'];
      expect(rel).toBeTruthy();
      expect(rel.target()).toEqual(AclRoleMapping);
    });
  });
});
