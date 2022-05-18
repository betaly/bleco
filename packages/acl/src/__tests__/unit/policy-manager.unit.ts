import {PolicyManager} from '../../policy.manager';
import {Entity, model, property} from '@loopback/repository';
import {AclRole, AclRoleActor} from '../../models';
import {Policy} from '../../policy';

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
    it('should defineRoleActorsRelationOnActor', function () {
      const userPolicy: Policy = {
        type: 'actor',
        model: User,
      };

      const definition = User.definition;
      expect(definition.relations).not.toHaveProperty('actorRoles');

      const policyManager = new PolicyManager();
      policyManager.add(userPolicy);
      expect(policyManager.has(User.name)).toBe(true);
      const rel = definition.relations['actorRoles'];
      expect(rel).toBeTruthy();
      expect(rel.target()).toEqual(AclRoleActor);
    });

    it('should defineRolesRelationOnResource', function () {
      const orgPolicy: Policy = {
        type: 'resource',
        model: Org,
      };
      const definition = Org.definition;
      expect(definition.relations).not.toHaveProperty('roles');

      const policyManager = new PolicyManager();
      policyManager.add(orgPolicy);
      expect(policyManager.has(Org.name)).toBe(true);
      const rel = definition.relations['roles'];
      expect(rel).toBeTruthy();
      expect(rel.target()).toEqual(AclRole);
    });
  });
});
