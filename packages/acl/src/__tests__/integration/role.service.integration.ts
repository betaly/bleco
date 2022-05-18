import {AclApp} from '../fixtures/application';
import {Samples} from '../fixtures/seeds/samples';
import {AclRoleService} from '../../services';
import {AclRoleActorRepository, AclRoleRepository} from '../../repositories';
import {givenApp, seed} from '../support';
import {AclBindings} from '../../keys';
import {generateRoleId, resolveResourcePolymorphic} from '../../helpers';
import {OrgPermissions, OrgRoles} from '../fixtures/policies';
import {AclRole} from '../../models';
import {Where} from '@loopback/repository';

describe('RoleActorService integration tests', function () {
  const TestDomainId = 'test';
  let app: AclApp;
  let samples: Samples;
  let roleService: AclRoleService;

  let roleRepo: AclRoleRepository;
  let roleActorRepo: AclRoleActorRepository;

  beforeEach(async () => {
    app = await givenApp({});
    app.bind(AclBindings.DOMAIN).to({id: TestDomainId});
    ({samples} = await seed(app));

    roleService = await app.get<AclRoleService>(`services.${AclRoleService.name}`);
    roleActorRepo = await app.getRepository(AclRoleActorRepository);
    roleRepo = await app.getRepository(AclRoleRepository);
  });

  it('should bind AclRoleService correctly', async () => {
    const service = await app.get<AclRoleService>(`services.${AclRoleService.name}`);
    expect(roleService).toBe(service);
  });

  describe('add', function () {
    it('should add custom role successfully', async () => {
      const {orgs} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      const role = await roleService.add({
        name: roleName,
        resource,
        permissions: [OrgPermissions.read, OrgPermissions.list_repos],
      });
      expect(role.id).toBe(generateRoleId(roleName, resource));
      expect(role.name).toBe(roleName);

      const found = (await roleRepo.findOne({where: {id: role.id}}))!;
      expect(found).toBeTruthy();
      expect(found.id).toBe(role.id);
      expect(found.name).toBe(role.name);
      expect(found.permissions).toEqual(role.permissions);
    });

    it('should throw error if role already exists', async () => {
      const {orgs} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      await roleService.add({name: roleName, resource});
      await expect(roleService.add({name: roleName, resource})).rejects.toThrow(
        `Role "${generateRoleId(roleName, resource)}" already exists`,
      );
    });

    it('should throw error if role is builtin', async () => {
      const {orgs} = samples;
      const roleName = OrgRoles.owner;
      const resource = orgs.google;

      await expect(roleService.add({name: roleName, resource})).rejects.toThrow(
        `Builtin role "${generateRoleId(roleName, resource)}" cannot be added.`,
      );
    });
  });

  describe('remove', function () {
    it('should remove custom role successfully', async () => {
      const {orgs} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      const role = await roleService.add({name: roleName, resource});
      const result = await roleService.remove(role);
      expect(result).toMatchObject({
        count: 1,
      });

      const found = await roleRepo.findOne({where: {id: role.id}});
      expect(found).toBeFalsy();
    });

    it('should remove all custom roles on resource', async () => {
      const {orgs} = samples;
      const role1 = 'test_role_1';
      const role2 = 'test_role_2';
      const resource = orgs.google;

      const where: Where<AclRole> = {
        domainId: TestDomainId,
        ...resolveResourcePolymorphic(resource),
      };

      await roleService.add({name: role1, resource});
      await roleService.add({name: role2, resource});
      expect((await roleRepo.count(where)).count).toBe(2);

      await roleService.removeForResource(resource);
      expect((await roleRepo.count(where)).count).toBe(0);
    });

    it('should return count 0 when to remove a role that does not exist', async () => {
      const {orgs} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      const role = await roleService.add({name: roleName, resource});
      let result = await roleService.remove(role);
      expect(result).toMatchObject({
        count: 1,
      });

      result = await roleService.remove(role);
      expect(result).toMatchObject({
        count: 0,
      });
    });

    it('should throw error if role is builtin', async () => {
      const {orgs} = samples;
      const roleName = OrgRoles.owner;
      const resource = orgs.google;

      await expect(roleService.remove(roleName, resource)).rejects.toThrow(
        `Builtin role "${roleName}" cannot be removed.`,
      );
    });

    it('should throw error if removing role with name and without resource', async () => {
      const {orgs} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      await roleService.add({name: roleName, resource});
      await expect(roleService.remove(roleName)).rejects.toThrow(`Cannot resolve "roleId" for role without resource`);
    });

    it('should remove related role actors successfully', async () => {
      const {orgs, users} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      const role = await roleService.add({name: roleName, resource});

      const actor = users.jerry;
      await roleActorRepo.create({
        domainId: TestDomainId,
        roleId: role.id,
        actorId: actor.id,
        ...resolveResourcePolymorphic(resource),
      });

      let found = await roleActorRepo.findOne({where: {roleId: role.id}});
      expect(found).toBeTruthy();

      const result = await roleService.remove(role);
      expect(result).toEqual({
        count: 1,
        details: {
          Role: 1,
          RoleActor: 1,
        },
      });

      found = await roleActorRepo.findOne({where: {roleId: role.id}});
      expect(found).toBeFalsy();
    });
  });

  describe('find', function () {
    it('should find roles by name and resource successfully', async () => {
      const {orgs} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      let found = await roleService.find({where: {name: roleName}});
      expect(found).toHaveLength(0);

      const role = await roleService.add({name: roleName, resource});
      found = await roleService.find({where: {name: roleName}});
      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(role.id);
    });
  });

  describe('findById', function () {
    it('should find role by id', async () => {
      const {orgs} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      const id = generateRoleId(roleName, resource);

      await expect(roleService.findById(id)).rejects.toThrow(/EntityNotFound/);

      const role = await roleService.add({name: roleName, resource});
      const found = await roleService.findById(id);
      expect(found).toBeTruthy();
      expect(found!.id).toBe(role.id);
    });
  });

  describe('findOne', function () {
    it('should find role by name and resource successfully', async () => {
      const {orgs} = samples;
      const roleName = 'test_role';
      const resource = orgs.google;

      let found = await roleService.findOne({where: {name: roleName, ...resolveResourcePolymorphic(resource)}});
      expect(found).toBeFalsy();

      const role = await roleService.add({name: roleName, resource});
      found = await roleService.findOne({where: {name: roleName, ...resolveResourcePolymorphic(resource)}});
      expect(found).toBeTruthy();
      expect(found!.id).toBe(role.id);
    });
  });

  // describe('permissions query', function () {
  //   it('should filter with permissions', async () => {
  //     const {orgs} = samples;
  //     const roleName = 'test_role';
  //     const resource = orgs.google;
  //
  //     const role = await roleService.add({
  //       name: roleName,
  //       resource,
  //       permissions: [OrgPermissions.read, OrgPermissions.list_repos],
  //     });
  //     const found = await roleRepo.find({
  //       where: {
  //         domainId: TestDomainId,
  //         ...resolveResourcePolymorphic(resource),
  //         permissions: [],
  //       },
  //     });
  //     expect(found).toHaveLength(1);
  //     expect(found[0].id).toBe(role.id);
  //   });
  // });
});
