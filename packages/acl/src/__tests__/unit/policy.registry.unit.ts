import {Entity, model, property} from '@loopback/repository';

import {AclRole, AclRoleMapping} from '../../models';
import {AclModelRelationKeys, PolicyRegistry, definePrincipalPolicy, defineResourcePolicy} from '../../policies';

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
    it('should throw error if model is not defined with @model()', function () {
      class Note extends Entity {
        @property({
          type: 'number',
          id: true,
          generated: true,
        })
        id?: number;
      }

      const NotePolicy = definePrincipalPolicy({
        model: Note,
      });

      const registry = new PolicyRegistry();
      expect(() => registry.add(NotePolicy)).toThrowError(
        /Note has no definition. Maybe you forgot to add decorator @model()?/i,
      );
    });

    it('should defineRolesRelationOnPrincipal', function () {
      const userPolicy = definePrincipalPolicy({
        model: User,
      });

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
      const orgPolicy = defineResourcePolicy({
        model: Org,
      });
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
