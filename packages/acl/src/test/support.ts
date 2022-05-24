import path from 'path';
import {givenHttpServerConfig} from '@loopback/testlab';
import {GitClubApplication, seed} from './fixtures';
import {AppInit} from './types';

export async function givenApp(init?: AppInit) {
  const app = new GitClubApplication({
    rest: givenHttpServerConfig(),
  });

  if (init) {
    await init(app);
  }
  await app.boot();
  await app.migrateSchema({existingSchema: 'drop'});
  const td = await seed(app);
  await app.start();
  return {app, td};
}

export function fixturesPath(...paths: string[]): string {
  return path.join(__dirname, 'fixtures', ...paths);
}

export function componentsPath(...paths: string[]): string {
  return fixturesPath('components', ...paths);
}
