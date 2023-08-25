import {QueryWhere} from 'loopback4-query';
import {Where} from '@loopback/repository';

import {toResourcePolymorphic} from '../../helpers';
import {AclBindings} from '../../keys';
import {AclRole} from '../../models';
import {AclRoleMappingRepository, AclRoleRepository} from '../../repositories';
import {AclRoleService} from '../../services';
import {GitClubApplication, OrgActions, OrgManagerActions, OrgRoles, TestData, TestDomain, givenApp} from '../../test';

describe('RoleService integration tests', function () {
  let app: GitClubApplication;
  let td: TestData;
  let roleService: AclRoleService;

  let roleRepo: AclRoleRepository;
  let roleMappingRepo: AclRoleMappingRepository;

  beforeEach(async () => {
    ({app, td} = await givenApp());

    roleService = await app.get<AclRoleService>(AclBindings.ROLE_SERVICE);

    roleMappingRepo = await app.getRepository(AclRoleMappingRepository);
    roleRepo = await app.getRepository(AclRoleRepository);
  });

  afterEach(async () => {
    await app.stop();
  });

  it('should bind AclRoleService correctly', async () => {
    const service = await app.get<AclRoleService>(AclBindings.ROLE_SERVICE);
    expect(roleService).toBe(service);
  });

  describe('add', function () {
    it('should add custom role successfully', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      const permissions = [OrgActions.read, OrgActions.list_repos];

      const role = await roleService.add({
        name: roleName,
        resource,
        actions: permissions,
      });
      expect(role.name).toBe(roleName);

      const found = (await roleRepo.findOne({where: {id: role.id}, include: ['permissions']}))!;
      expect(found).toBeTruthy();
      expect(found.id).toBe(role.id);
      expect(found.name).toBe(role.name);
      expect(found.permissions?.map(p => p.action).sort()).toEqual(permissions.sort());
    });

    it('should throw error if role already exists', async () => {
      const {orgs} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      await roleService.add({name: roleName, resource});
      await expect(
        roleService.add({
          name: roleName,
          resource,
        }),
      ).rejects.toThrow('The following role(s) already exist');
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

      const roles = await roleService.addAllInDomain(
        [
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
        ],
        TestDomain,
      );
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

      const newPermissions = [OrgActions.read, OrgActions.list_repos];
      const role = (await roleService.findOneInDomain(
        {where: {name: 'manager', ...toResourcePolymorphic(resource)}},
        TestDomain,
        {include: ['permissions']},
      ))!;
      expect(role).toBeDefined();
      const oldPermissions = role.permissions?.map(p => p.action);
      expect(oldPermissions?.sort()).not.toEqual(newPermissions.sort());

      await roleService.updatePermissions(role.id, newPermissions);
      const found = (await roleRepo.findById(role.id, {include: ['permissions']}))!;
      expect(found).toBeTruthy();
      expect(found.id).toBe(role.id);
      expect(found.name).toBe(role.name);
      expect(found.permissions?.map(p => p.action).sort()).toEqual(newPermissions.sort());
    });
  });

  describe('delete', function () {
    it('should delete one custom role successfully', async () => {
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

    it('should delete multiple custom roles successfully', async () => {
      const {orgs} = td;
      const role1Name = 'test_role_1';
      const role2Name = 'test_role_2';
      const role3Name = 'test_role_3';
      const resource = orgs.google;

      const where: QueryWhere<AclRole> = {
        domain: TestDomain,
        ...toResourcePolymorphic(resource),
      };

      const role1 = await roleService.addInDomain({name: role1Name, resource}, TestDomain);
      const role2 = await roleService.addInDomain({name: role2Name, resource}, TestDomain);
      const role3 = await roleService.addInDomain({name: role3Name, resource}, TestDomain);
      expect((await roleRepo.count(where as Where)).count).toBe(3);

      await roleService.deleteInDomain([role1, role2.id], TestDomain);
      expect((await roleRepo.count(where as Where)).count).toBe(1);

      const found = await roleRepo.findById(role3.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(role3.id);
    });

    it('should delete all custom roles on resource', async () => {
      const {orgs} = td;
      const role1 = 'test_role_1';
      const role2 = 'test_role_2';
      const resource = orgs.google;

      const where: QueryWhere<AclRole> = {
        domain: TestDomain,
        ...toResourcePolymorphic(resource),
      };

      await roleService.addInDomain({name: role1, resource}, TestDomain);
      await roleService.addInDomain({name: role2, resource}, TestDomain);
      expect((await roleRepo.count(where as Where)).count).toBe(2);

      await roleService.deleteForResourceInDomain(resource, TestDomain);
      expect((await roleRepo.count(where as Where)).count).toBe(0);
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

    it('should delete nothing when trying to delete builtin role', async () => {
      const answer = await roleService.delete(OrgRoles.owner);
      expect(answer?.count).toBe(0);
    });

    it('should delete related role mappings successfully', async () => {
      const {orgs, users} = td;
      const roleName = 'test_role';
      const resource = orgs.google;

      const role = await roleService.addInDomain({name: roleName, resource}, TestDomain);

      const principal = users.jerry;
      await roleMappingRepo.create({
        domain: TestDomain,
        roleId: role.id,
        principalId: principal.id,
        ...toResourcePolymorphic(resource),
      });

      let found = await roleMappingRepo.findOne({where: {roleId: role.id, domain: TestDomain}});
      expect(found).toBeTruthy();

      const result = await roleService.deleteInDomain(role, TestDomain);
      expect(result).toEqual({
        count: 1,
        details: {
          Role: 1,
          RolePermission: 0,
          RoleMapping: 1,
        },
      });

      found = await roleMappingRepo.findOne({where: {roleId: role.id, domain: TestDomain}});
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
        where: {name: roleName, ...toResourcePolymorphic(resource)} as Where,
        include: ['permissions'],
      }))!;
      expect(found).toBeTruthy();
      expect(found.name).toBe('manager');
      expect(found.permissions?.map(p => p.action).sort()).toEqual(OrgManagerActions.sort());
    });

    it('check some one has permission on the resource with repository', async () => {
      const {orgs, users} = td;
      // const roleName = 'manager';
      const resource = orgs.tesla;

      // "tom" is a manager of "tesla" and have create_repo permission on "tesla"
      let found = await roleMappingRepo.query?.findOne({
        where: {
          domain: TestDomain,
          principalId: users.tom.id,
          ...toResourcePolymorphic(resource),
          'role.permissions.action': OrgActions.create_role_assignments,
        },
      });

      expect(found).toBeTruthy();
      expect(found!.principalId).toBe(users.tom.id);
      // expect(found!.roleId).toBe(generateRoleId(roleName, resource));

      // "jerry" haven't create_repo permission on "tesla"
      found = await roleMappingRepo.query?.findOne({
        where: {
          domain: TestDomain,
          principalId: users.jerry.id,
          ...toResourcePolymorphic(resource),
          'role.permissions.action': OrgActions.create_repos,
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

      const role = await roleService.add({name: roleName, resource});
      const found = await roleService.findById(role.id);
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
