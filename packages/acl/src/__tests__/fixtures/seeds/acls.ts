import {AclApp} from '../application';
import {TestDomain} from '../constants';
import {RoleMappingRepository, RolePermissionRepository, RoleRepository} from '../../../repositories';
import {OrgPermissions, OrgRoles} from '../policies';
import {generateRoleId, toPrincipalPolymorphic, toResourcePolymorphic} from '../../../helpers';
import {Samples} from './samples';

export type ACLs = Awaited<ReturnType<typeof seedACLs>>;

export async function seedACLs(app: AclApp, mainData: Samples) {
  const roleRepo = await app.getRepository(RoleRepository);
  const roleMappingRepo = await app.getRepository(RoleMappingRepository);
  const rolePermissionRepo = await app.getRepository(RolePermissionRepository);

  const {orgs, users} = mainData;

  // TESLA
  // --------------------------------------------------------------------------------
  // create 'manager' role
  const managerRole = await roleRepo.create({
    domain: TestDomain,
    name: 'manager',
    ...toResourcePolymorphic(orgs.tesla),
  });

  await rolePermissionRepo.createAll(
    Object.values(OrgPermissions).map(p => ({
      domain: TestDomain,
      roleId: managerRole.id,
      permission: p,
    })),
  );

  // assign 'owner' on 'tesla' to 'musk'
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: generateRoleId(OrgRoles.owner, orgs.tesla),
    ...toPrincipalPolymorphic(users.musk),
    ...toResourcePolymorphic(orgs.tesla),
  });

  // assign 'manager' on 'tesla' to 'tom'
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: generateRoleId('manager', orgs.tesla),
    ...toPrincipalPolymorphic(users.tom),
    ...toResourcePolymorphic(orgs.tesla),
  });

  // assign 'member' on 'tesla' to 'jerry'
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: generateRoleId(OrgRoles.member, orgs.tesla),
    ...toPrincipalPolymorphic(users.jerry),
    ...toResourcePolymorphic(orgs.tesla),
  });

  // Google
  // --------------------------------------------------------------------------------
  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: generateRoleId(OrgRoles.owner, orgs.google),
    ...toPrincipalPolymorphic(users.james),
    ...toResourcePolymorphic(orgs.google),
  });

  await roleMappingRepo.create({
    domain: TestDomain,
    roleId: generateRoleId(OrgRoles.member, orgs.google),
    ...toPrincipalPolymorphic(users.ava),
    ...toResourcePolymorphic(orgs.google),
  });
}
