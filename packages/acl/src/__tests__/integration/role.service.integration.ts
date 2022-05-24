import {Where} from '@loopback/repository';
import {RoleService} from '../../services';
import {RoleMappingRepository, RoleRepository} from '../../repositories';
import {AclBindings} from '../../keys';
import {generateRoleId, resolveRoleId, toResourcePolymorphic} from '../../helpers';
import {Role} from '../../models';
import {
  GitClubApplication,
  givenApp,
  OrgManagerPermissions,
  OrgPermissions,
  OrgRoles,
  TestData,
  TestDomain,
} from '../../test';

describe('RoleService integration tests', function () {
  let app: GitClubApplication;
  let td: TestData;
  let roleService: RoleService;

  let roleRepo: RoleRepository;
  let roleMappingRepo: RoleMappingRepository;

  beforeEach(async () => {
    ({app, td} = await givenApp());
    app.bind(AclBindings.DOMAIN).to({id: TestDomain});

    roleService = await app.get<RoleService>(AclBindings.ROLE_SERVICE);
    roleMappingRepo = await app.getRepository(RoleMappingRepository);
    roleRepo = await app.getRepository(RoleRepository);
  });

  afterEach(async () => {
    await app.stop();
  });

  it('should bind AclRoleService correctly', async () => {
    const service = await app.get<RoleService>(AclBindings.ROLE_SERVICE);
    expect(roleService).toBe(service);
  });

  describe('add', function () {
    it('should add custom role successfully', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      const permissions = [OrgPermissions.read, OrgPermissions.list_repos];

      const role = await roleService.add({
        name: roleName,
        resource,
        permissions,
      });
      expect(role.id).toBe(generateRoleId(roleName, resource));
      expect(role.name).toBe(roleName);

      const found = (await roleRepo.findOne({where: {id: role.id}, include: ['permissions']}))!;
      expect(found).toBeTruthy();
      expect(found.id).toBe(role.id);
      expect(found.name).toBe(role.name);
      expect(found.permissions?.map(p => p.permission).sort()).toEqual(permissions.sort());
    });

    it('should throw error if role already exists', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      await roleService.add({name: roleName, resource});
      await expect(roleService.add({name: roleName, resource})).rejects.toThrow('The following role(s) already exist');
    });

    it('should throw error if role is builtin', async () => {
      const {orgs} = td;
      const roleName = OrgRoles.owner;
      const resource = orgs.google;

      await expect(roleService.add({name: roleName, resource})).rejects.toThrow(
        `Builtin role "${roleName}" cannot be added.`,
      );
    });
  });

  describe('addAll', function () {
    it('should add all custom roles successfully', async () => {
      const {orgs} = td;

      const roles = await roleService.addAll([
        {
          name: 'test_role_1',
          resource: orgs.google,
        },
        {
          name: 'test_role_2',
          resource: orgs.google,
        },
        {
          name: 'test_role_3',
          resource: orgs.twitter,
        },
      ]);
      expect(roles).toHaveLength(3);
      const founds = await roleRepo.find({
        where: {
          name: {inq: ['test_role_1', 'test_role_2', 'test_role_3']},
          domain: TestDomain,
        },
      });
      expect(founds).toHaveLength(3);
    });
  });

  describe('update permissions', function () {
    it('should update permissions successfully', async () => {
      const {orgs} = td;
      const resource = orgs.tesla;

      const newPermissions = [OrgPermissions.read, OrgPermissions.list_repos];
      const role = await roleService.findById(generateRoleId('manager', resource), {include: ['permissions']});
      const oldPermissions = role.permissions?.map(p => p.permission);
      expect(oldPermissions?.sort()).not.toEqual(newPermissions.sort());

      await roleService.updatePermissions(role.id, newPermissions);
      const found = (await roleRepo.findById(role.id, {include: ['permissions']}))!;
      expect(found).toBeTruthy();
      expect(found.id).toBe(role.id);
      expect(found.name).toBe(role.name);
      expect(found.permissions?.map(p => p.permission).sort()).toEqual(newPermissions.sort());
    });
  });

  describe('delete', function () {
    it('should delete custom role successfully', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      const role = await roleService.add({name: roleName, resource});
      const result = await roleService.delete(role);
      expect(result).toMatchObject({
        count: 1,
      });

      const found = await roleRepo.findOne({where: {id: role.id}});
      expect(found).toBeFalsy();
    });

    it('should delete all custom roles on resource', async () => {
      const {orgs} = td;
      const role1 = 'test_role_1';
      const role2 = 'test_role_2';
      const resource = orgs.google;

      const where: Where<Role> = {
        domain: TestDomain,
        ...toResourcePolymorphic(resource),
      };

      await roleService.add({name: role1, resource});
      await roleService.add({name: role2, resource});
      expect((await roleRepo.count(where)).count).toBe(2);

      await roleService.deleteInResource(resource);
      expect((await roleRepo.count(where)).count).toBe(0);
    });

    it('should delete all custom roles with "*" on resource', async () => {
      const {orgs} = td;
      const role1 = 'test_role_1';
      const role2 = 'test_role_2';
      const resource = orgs.google;

      const where: Where<Role> = {
        domain: TestDomain,
        ...toResourcePolymorphic(resource),
      };

      await roleService.add({name: role1, resource});
      await roleService.add({name: role2, resource});
      expect((await roleRepo.count(where)).count).toBe(2);

      await roleService.deleteInResource('*', resource);
      expect((await roleRepo.count(where)).count).toBe(0);
    });

    it('should delete specified custom roles on resource', async () => {
      const {orgs} = td;
      const role1 = 'test_role_1';
      const role2 = 'test_role_2';
      const role3 = 'test_role_3';
      const resource = orgs.google;

      const where: Where<Role> = {
        domain: TestDomain,
        ...toResourcePolymorphic(resource),
      };

      await roleService.add({name: role1, resource});
      await roleService.add({name: role2, resource});
      await roleService.add({name: role3, resource});
      expect((await roleRepo.count(where)).count).toBe(3);

      await roleService.deleteInResource(['test_role_1', 'test_role_2'], resource);

      const found = await roleRepo.findOne({where});
      expect(found?.name).toEqual('test_role_3');
    });

    it('should return count 0 when to delete a role that does not exist', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      const role = await roleService.add({name: roleName, resource});
      let result = await roleService.delete(role);
      expect(result).toMatchObject({
        count: 1,
      });

      result = await roleService.delete(role);
      expect(result).toMatchObject({
        count: 0,
      });
    });

    it('should throw error if role is builtin', async () => {
      const {orgs} = td;
      const roleName = OrgRoles.owner;
      const resource = orgs.google;

      await expect(roleService.delete(resolveRoleId(roleName, resource))).rejects.toThrow(
        `Builtin role "${roleName}" cannot be deleted.`,
      );
    });

    it('should throw error if removing role with name and without resource', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      await roleService.add({name: roleName, resource});
      await expect(roleService.delete(roleName)).rejects.toThrow(`Cannot resolve "roleId" for role without resource`);
    });

    it('should delete related role mappings successfully', async () => {
      const {orgs, users} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      const role = await roleService.add({name: roleName, resource});

      const principal = users.jerry;
      await roleMappingRepo.create({
        domain: TestDomain,
        roleId: role.id,
        principalId: principal.id,
        ...toResourcePolymorphic(resource),
      });

      let found = await roleMappingRepo.findOne({where: {roleId: role.id}});
      expect(found).toBeTruthy();

      const result = await roleService.delete(role);
      expect(result).toEqual({
        count: 1,
        details: {
          Role: 1,
          RolePermission: 0,
          RoleMapping: 1,
        },
      });

      found = await roleMappingRepo.findOne({where: {roleId: role.id}});
      expect(found).toBeFalsy();
    });
  });

  describe('find', function () {
    it('should find roles by name and resource successfully', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      let found = await roleService.find({where: {name: roleName}});
      expect(found).toHaveLength(0);

      const role = await roleService.add({name: roleName, resource});
      found = await roleService.find({where: {name: roleName}});
      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(role.id);
    });

    it('should load permissions with permission inclusion', async () => {
      const {orgs} = td;
      const roleName = 'manager';
      const resource = orgs.tesla;

      const found = (await roleRepo.findOne({
        where: {name: roleName, ...toResourcePolymorphic(resource)},
        include: ['permissions'],
      }))!;
      expect(found).toBeTruthy();
      expect(found.name).toBe('manager');
      expect(found.permissions?.map(p => p.permission).sort()).toEqual(OrgManagerPermissions.sort());
    });

    it('check some one has permission on the resource with repository', async () => {
      const {orgs, users} = td;
      const roleName = 'manager';
      const resource = orgs.tesla;

      // "tom" is a manager of "tesla" and have create_repo permission on "tesla"
      let found = await roleMappingRepo.query?.findOne({
        where: {
          domain: TestDomain,
          principalId: users.tom.id,
          ...toResourcePolymorphic(resource),
          'role.permissions.permission': OrgPermissions.create_role_assignments,
        },
      });

      expect(found).toBeTruthy();
      expect(found!.principalId).toBe(users.tom.id);
      expect(found!.roleId).toBe(generateRoleId(roleName, resource));

      // "jerry" haven't create_repo permission on "tesla"
      found = await roleMappingRepo.query?.findOne({
        where: {
          domain: TestDomain,
          principalId: users.jerry.id,
          ...toResourcePolymorphic(resource),
          'role.permissions.permission': OrgPermissions.create_repos,
        },
      });

      expect(found).toBeFalsy();
    });
  });

  describe('findById', function () {
    it('should find role by id', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      const id = generateRoleId(roleName, resource);

      await expect(roleService.findById(id)).rejects.toThrow(/Entity not found:/);

      const role = await roleService.add({name: roleName, resource});
      const found = await roleService.findById(id);
      expect(found).toBeTruthy();
      expect(found!.id).toBe(role.id);
    });
  });

  describe('findOne', function () {
    it('should find role by name and resource successfully', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      let found = await roleService.findOne({where: {name: roleName, ...toResourcePolymorphic(resource)}});
      expect(found).toBeFalsy();

      const role = await roleService.add({name: roleName, resource});
      found = await roleService.findOne({where: {name: roleName, ...toResourcePolymorphic(resource)}});
      expect(found).toBeTruthy();
      expect(found!.id).toBe(role.id);
    });
  });
});
