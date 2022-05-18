import {Where} from '@loopback/repository';
import {givenApp, seed} from '../support';
import {AclApp} from '../fixtures/application';
import {Samples} from '../fixtures/seeds/samples';
import {AclRoleActorRepository, AclRoleRepository} from '../../repositories';
import {OrgRoles} from '../fixtures/policies';
import {AclRoleActor} from '../../models';
import {generateRoleId, isRoleId, resolveResourcePolymorphic} from '../../helpers';
import {AclRoleActorService} from '../../services';
import {AclBindings} from '../..';
import {TestDomainId} from '../fixtures/constants';

describe('RoleActorService integration tests', function () {
  let app: AclApp;
  let samples: Samples;
  let roleActorService: AclRoleActorService;

  let roleRepo: AclRoleRepository;
  let roleActorRepo: AclRoleActorRepository;

  beforeEach(async () => {
    app = await givenApp({});
    app.bind(AclBindings.DOMAIN).to({id: TestDomainId});
    ({samples} = await seed(app));

    roleActorService = await app.get<AclRoleActorService>(`services.${AclRoleActorService.name}`);
    roleActorRepo = await app.getRepository(AclRoleActorRepository);
    roleRepo = await app.getRepository(AclRoleRepository);
  });

  it('should bind AclRoleActorService correctly', async () => {
    const service = await app.get<AclRoleActorService>(`services.${AclRoleActorService.name}`);
    expect(roleActorService).toBe(service);
  });

  it('should throw error if role does not exist', async () => {
    const {users, orgs} = samples;
    await expect(roleActorService.add(users.tom, 'i_am_not_role', orgs.google)).rejects.toThrow(
      /Role i_am_not_role dose not exist on resource/,
    );
  });

  describe('add', function () {
    describe('builtin roles', function () {
      it('should assign a builtin resource role for user', async () => {
        const {users, orgs} = samples;
        const actor = users.tom;
        const roleName = OrgRoles.owner;
        const resource = orgs.google;

        const roleId = generateRoleId(roleName, resource);

        const where: Where<AclRoleActor> = {
          domainId: TestDomainId,
          actorId: actor.id,
          roleId,
          ...resolveResourcePolymorphic(resource),
        };
        let found;

        found = await roleActorRepo.findOne({where});
        expect(found).toBeFalsy();

        const roleActor = await roleActorService.add(users.tom, roleName, orgs.google);

        found = await roleActorRepo.findOne({where});
        expect(found).toMatchObject({...roleActor, roleId, domainId: TestDomainId, deletedOn: null, deletedBy: null});
      });
    });

    describe('custom roles', function () {
      it('should assign a custom resource role for user', async () => {
        const {users, orgs} = samples;
        const actor = users.tom;
        const roleName = 'custom_role';
        const resource = orgs.google;

        const role = await roleRepo.create({
          domainId: TestDomainId,
          name: roleName,
          ...resolveResourcePolymorphic(resource),
        });

        expect(isRoleId(role.id)).toBe(true);

        const roleActor = await roleActorService.add(actor, roleName, resource);

        expect(roleActor).toMatchObject({
          domainId: TestDomainId,
          actorId: actor.id,
          roleId: role.id,
          ...resolveResourcePolymorphic(resource),
        });
      });
    });
  });

  describe('find', function () {
    it('should find all role actors on the resource', async () => {
      const {users, orgs} = samples;
      const actor = users.tom;
      const roleName = OrgRoles.owner;
      const resource = orgs.google;

      const roleActor = await roleActorService.add(actor, roleName, resource);
      await roleActorService.add(users.jerry, roleName, resource);

      const founds = await roleActorService.find({where: {actor, resource}});
      expect(founds[0]).toMatchObject({...roleActor, deletedBy: null, deletedOn: null});
    });
  });

  describe('remove', function () {
    it('should remove role actor for an actor on the resource', async () => {
      const {users, orgs} = samples;
      const actor = users.tom;
      const role = OrgRoles.owner;
      const resource = orgs.google;

      const roleActor = await roleActorService.add(actor, role, resource);

      let founds = await roleActorService.find({where: {id: roleActor.id, resource}});
      expect(founds).toHaveLength(1);

      await roleActorService.remove({actor, role, resource});

      founds = await roleActorService.find({where: {id: roleActor.id, resource}});
      expect(founds).toHaveLength(0);
    });

    it('should remove all role actors on the resource', async () => {
      const {orgs} = samples;
      const resource = orgs.tesla;

      const where = {
        domainId: TestDomainId,
        ...resolveResourcePolymorphic(resource),
      };

      let found = await roleActorRepo.find({where});
      expect(found.length).toBeGreaterThan(0);

      await roleActorService.remove({resource});
      found = await roleActorRepo.find({where});
      expect(found).toHaveLength(0);
    });

    it('should remove all role actors for some actor on the resource', async () => {
      const {users, orgs} = samples;
      const actor = users.james;
      const resource = orgs.google;

      const where = {
        domainId: TestDomainId,
        actorId: actor.id,
        ...resolveResourcePolymorphic(resource),
      };

      let found = await roleActorRepo.find({where});
      expect(found.length).toBeGreaterThan(0);

      await roleActorService.remove({actor});
      found = await roleActorRepo.find({where});
      expect(found).toHaveLength(0);
    });
  });
});
