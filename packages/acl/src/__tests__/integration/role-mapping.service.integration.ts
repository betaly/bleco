import {Where} from '@loopback/repository';
import {RoleMappingRepository, RoleRepository} from '../../repositories';
import {RoleMapping} from '../../models';
import {generateRoleId, isRoleId, toPrincipalPolymorphic, toResourcePolymorphic} from '../../helpers';
import {RoleMappingService} from '../../services';
import {AclBindings} from '../..';
import {GitClubApplication, givenApp, OrgRoles, TestData, TestDomain} from '../../test';

describe('RoleMappingService integration tests', function () {
  let app: GitClubApplication;
  let td: TestData;
  let roleMappingService: RoleMappingService;

  let roleRepo: RoleRepository;
  let roleMappingRepo: RoleMappingRepository;

  beforeEach(async () => {
    ({app, td} = await givenApp());
    app.bind(AclBindings.DOMAIN).to({id: TestDomain});

    roleMappingService = await app.get<RoleMappingService>(AclBindings.ROLE_MAPPING_SERVICE);
    roleMappingRepo = await app.getRepository(RoleMappingRepository);
    roleRepo = await app.getRepository(RoleRepository);
  });
  
  afterEach(async () => {
    await app.stop();
  });

  it('should bind AclRoleActorService correctly', async () => {
    const service = await app.get<RoleMappingService>(AclBindings.ROLE_MAPPING_SERVICE);
    expect(roleMappingService).toBe(service);
  });

  it('should throw error if role does not exist', async () => {
    const {users, orgs} = td;
    await expect(roleMappingService.add(users.tom, 'i_am_not_role', orgs.google)).rejects.toThrow(
      /Role i_am_not_role dose not exist on resource/,
    );
  });

  describe('add', function () {
    describe('builtin roles', function () {
      it('should assign a builtin resource role for user', async () => {
        const {users, orgs} = td;
        const principal = users.tom;
        const roleName = OrgRoles.owner;
        const resource = orgs.google;

        const roleId = generateRoleId(roleName, resource);

        const where: Where<RoleMapping> = {
          domain: TestDomain,
          roleId,
          ...toPrincipalPolymorphic(principal),
          ...toResourcePolymorphic(resource),
        };
        let found;

        found = await roleMappingRepo.findOne({where});
        expect(found).toBeFalsy();

        const roleMapping = await roleMappingService.add(users.tom, roleName, orgs.google);

        found = await roleMappingRepo.findOne({where});
        expect(found).toMatchObject({...roleMapping, roleId, domain: TestDomain});
      });
    });

    describe('custom roles', function () {
      it('should assign a custom resource role for user', async () => {
        const {users, orgs} = td;
        const principal = users.tom;
        const roleName = 'custom_role';
        const resource = orgs.google;

        const role = await roleRepo.create({
          domain: TestDomain,
          name: roleName,
          ...toResourcePolymorphic(resource),
        });

        expect(isRoleId(role.id)).toBe(true);

        const roleMapping = await roleMappingService.add(principal, roleName, resource);

        expect(roleMapping).toMatchObject({
          domain: TestDomain,
          roleId: role.id,
          ...toPrincipalPolymorphic(principal),
          ...toResourcePolymorphic(resource),
        });
      });
    });
  });

  describe('find', function () {
    it('should find all role actors on the resource', async () => {
      const {users, orgs} = td;
      const principal = users.tom;
      const roleName = OrgRoles.owner;
      const resource = orgs.google;

      const roleMapping = await roleMappingService.add(principal, roleName, resource);
      await roleMappingService.add(users.jerry, roleName, resource);

      const founds = await roleMappingService.find({
        where: {
          ...toPrincipalPolymorphic(principal),
          ...toResourcePolymorphic(resource),
        },
      });
      expect(founds[0]).toMatchObject(roleMapping);
    });
  });

  describe('remove', function () {
    it('should remove the role mapping for an principal on the resource', async () => {
      const {users, orgs} = td;
      const principal = users.tom;
      const role = OrgRoles.owner;
      const resource = orgs.google;

      const roleMapping = await roleMappingService.add(principal, role, resource);

      let founds = await roleMappingService.find({where: {id: roleMapping.id, ...toResourcePolymorphic(resource)}});
      expect(founds).toHaveLength(1);

      await roleMappingService.remove({principal, role, resource});

      founds = await roleMappingService.find({where: {id: roleMapping.id, ...toResourcePolymorphic(resource)}});
      expect(founds).toHaveLength(0);
    });

    it('should remove all role mappings on the resource', async () => {
      const {orgs} = td;
      const resource = orgs.tesla;

      const where = {
        domain: TestDomain,
        ...toResourcePolymorphic(resource),
      };

      let found = await roleMappingRepo.find({where});
      expect(found.length).toBeGreaterThan(0);

      await roleMappingService.remove({resource});
      found = await roleMappingRepo.find({where});
      expect(found).toHaveLength(0);
    });

    it('should remove all role actors for some principal on the resource', async () => {
      const {users, orgs} = td;
      const principal = users.james;
      const resource = orgs.google;

      const where = {
        domain: TestDomain,
        ...toPrincipalPolymorphic(principal),
        ...toResourcePolymorphic(resource),
      };

      let found = await roleMappingRepo.find({where});
      expect(found.length).toBeGreaterThan(0);

      await roleMappingService.remove({principal});
      found = await roleMappingRepo.find({where});
      expect(found).toHaveLength(0);
    });
  });
});
