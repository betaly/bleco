/* eslint-disable-next-line @typescript-eslint/no-unused-vars */

import {AclApp} from '../application';
import {OrgRepository, UserRepository} from '../repositories';

export type DefaultRecords = Awaited<ReturnType<typeof seedDefault>>;

export async function seedDefault(app: AclApp) {
  const userRepo = await app.getRepository(UserRepository);
  const orgRepo = await app.getRepository(OrgRepository);

  const tom = await userRepo.create({name: 'Tom'});
  const jerry = await userRepo.create({name: 'Jerry'});

  const users = {tom, jerry};

  const google = await orgRepo.create({name: 'Google'});
  const twitter = await orgRepo.create({name: 'Twitter'});

  const orgs = {google, twitter};

  return {users, orgs};
}
