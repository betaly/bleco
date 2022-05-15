import path from 'path';
import {AclApp} from './fixtures/application';
import {Application, ApplicationConfig} from '@loopback/core';

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
