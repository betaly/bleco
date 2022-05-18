import path from 'path';
import {AclApp} from './fixtures/application';
import {Application, ApplicationConfig} from '@loopback/core';
import {seedSamples} from './fixtures/seeds/samples';
import {seedACLs} from './fixtures/seeds/acls';

export type Seed = (app: Application) => Promise<void>;

export function fixturesPath(...paths: string[]): string {
  return path.join(__dirname, 'fixtures', ...paths);
}

export async function givenApp(options?: ApplicationConfig): Promise<AclApp> {
  const app = new AclApp(options);
  await app.boot();
  await app.migrateSchema({existingSchema: 'drop'});
  return app;
}

export async function seed(app: AclApp) {
  const samples = await seedSamples(app);
  await seedACLs(app, samples);
  return {samples};
}
