import {AclApp} from '../fixtures/application';
import {givenApp} from '../support';
import {DefaultRecords, seedDefault} from '../fixtures/seeds/default';
import {AclService} from '../../services';
import {AclRoleActorRepository, AclRoleRepository} from "../../repositories";
import {OrgRoles} from "../fixtures/policies";
import {Where} from "@loopback/repository";
import {AclRoleActor} from "../../models";
import {resourcePolymorphic} from "../../helpers";

describe('AclService integration tests', function () {
  let app: AclApp;
  let records: DefaultRecords;
  let aclService: AclService;

  let actorRoleRepo: AclRoleActorRepository;
  let roleRepo: AclRoleRepository;

  beforeEach(async () => {
    app = await givenApp({});
    records = await seedDefault(app);
    aclService = await app.get<AclService>('services.AclService');
    actorRoleRepo = await app.getRepository(AclRoleActorRepository);
    roleRepo = await app.getRepository(AclRoleRepository);
  });

  it('should bind AclService correctly', async () => {
    const aclService2 = await app.get<AclService>('services.AclService');
    expect(aclService).toBeTruthy();
    expect(aclService).toBe(aclService2);
  });

  describe('addRole', function () {

  });

  describe('addActorRole', function () {
    describe('builtin roles', function () {
      it('should assign a builtin resource role for user', async () => {
        const {users, orgs} = records;
        const actor = users.tom;
        const roleName = OrgRoles.owner;
        const resource = orgs.google;

        const where: Where<AclRoleActor> = {
          actorId: actor.id,
          name: roleName,
          ...resourcePolymorphic(resource),
        };
        let found;

        found = await actorRoleRepo.findOne({where});
        expect(found).toBeFalsy();

        const actorRole = await aclService.addRoleActor(users.tom, roleName, orgs.google);
        found = await actorRoleRepo.findOne({where});
        expect(found).toMatchObject({...actorRole, roleId: null, domainId: ''});
      });

      it('should throw error if role does not exist', async () => {
        const {users, orgs} = records;
        await expect(aclService.addRoleActor(users.tom, 'i_am_not_role', orgs.google)).rejects.toThrow(/Role i_am_not_role dose not exist on resource/)
      });
    });

    describe('custom roles', function () {
      it('should assign a custom resource role for user', async () => {
        //
      });
    });
  });
});
