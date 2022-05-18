import {AclApp} from '../application';
import {TestDomainId} from '../constants';
import {AclRoleActorRepository, AclRolePermissionRepository, AclRoleRepository} from '../../../repositories';
import {OrgPermissions, OrgRoles} from '../policies';
import {generateRoleId, resolveResourcePolymorphic} from '../../../helpers';
import {Samples} from './samples';

export type ACLs = Awaited<ReturnType<typeof seedACLs>>;

export async function seedACLs(app: AclApp, mainData: Samples) {
  const roleRepo = await app.getRepository(AclRoleRepository);
  const roleActorRepo = await app.getRepository(AclRoleActorRepository);
  const rolePermissionRepo = await app.getRepository(AclRolePermissionRepository);

  const {orgs, users} = mainData;

  // TESLA
  // --------------------------------------------------------------------------------
  // create 'manager' role
  const managerRole = await roleRepo.create({
    domainId: TestDomainId,
    name: 'manager',
    ...resolveResourcePolymorphic(orgs.tesla),
  });

  await rolePermissionRepo.createAll(
    Object.values(OrgPermissions).map(p => ({
      domainId: TestDomainId,
      roleId: managerRole.id,
      permission: p,
    })),
  );

  // assign 'owner' on 'tesla' to 'musk'
  await roleActorRepo.create({
    domainId: TestDomainId,
    actorId: users.musk.id,
    roleId: generateRoleId(OrgRoles.owner, orgs.tesla),
    ...resolveResourcePolymorphic(orgs.tesla),
  });

  // assign 'manager' on 'tesla' to 'tom'
  await roleActorRepo.create({
    domainId: TestDomainId,
    actorId: users.tom.id,
    roleId: generateRoleId('manager', orgs.tesla),
    ...resolveResourcePolymorphic(orgs.tesla),
  });

  // assign 'member' on 'tesla' to 'jerry'
  await roleActorRepo.create({
    domainId: TestDomainId,
    actorId: users.jerry.id,
    roleId: generateRoleId(OrgRoles.member, orgs.tesla),
    ...resolveResourcePolymorphic(orgs.tesla),
  });

  // Google
  // --------------------------------------------------------------------------------
  await roleActorRepo.create({
    domainId: TestDomainId,
    actorId: users.james.id,
    roleId: generateRoleId(OrgRoles.owner, orgs.google),
    ...resolveResourcePolymorphic(orgs.google),
  });

  await roleActorRepo.create({
    domainId: TestDomainId,
    actorId: users.ava.id,
    roleId: generateRoleId(OrgRoles.member, orgs.google),
    ...resolveResourcePolymorphic(orgs.google),
  });
}
