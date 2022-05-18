/* eslint-disable-next-line @typescript-eslint/no-unused-vars */

import {AclApp} from '../application';
import {OrgRepository, UserRepository} from '../repositories';

export type Samples = Awaited<ReturnType<typeof seedSamples>>;

export async function seedSamples(app: AclApp) {
  const userRepo = await app.getRepository(UserRepository);
  const orgRepo = await app.getRepository(OrgRepository);

  const musk = await userRepo.create({name: 'Musk'});
  const tom = await userRepo.create({name: 'Tom'});
  const jerry = await userRepo.create({name: 'Jerry'});
  const ava = await userRepo.create({name: 'Ava'});
  const james = await userRepo.create({name: 'James'});

  const users = {musk, tom, jerry, ava, james};

  const tesla = await orgRepo.create({name: 'Tesla'});
  const google = await orgRepo.create({name: 'Google'});
  const twitter = await orgRepo.create({name: 'Twitter'});

  const orgs = {tesla, google, twitter};

  return {users, orgs};
}
