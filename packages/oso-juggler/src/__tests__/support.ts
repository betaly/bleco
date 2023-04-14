import {RepoBindings} from '@bleco/repo';
import {Entity} from '@loopback/repository';
import {givenHttpServerConfig} from '@loopback/testlab';
import {Class} from 'oso/dist/src/types';
import path from 'path';

import {OsoApp} from './fixtures/application';
import {Enforcer} from './fixtures/enforcer';

export function fixturesPath(...segments: string[]): string {
  return path.join(__dirname, 'fixtures', ...segments);
}

export async function givenAppAndEnforcer() {
  const app = new OsoApp({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.migrateSchema({existingSchema: 'drop'});
  await app.start();

  const enforcer = new Enforcer(await app.get(RepoBindings.REPOSITORY_FACTORY));
  await enforcer.registerModelsFromApplication(app);
  return {app, enforcer};
}

export async function checkAuthz<A = unknown, R extends Entity = Entity>(
  oso: Enforcer<A, unknown, R>,
  actor: A,
  action: string | number,
  resource: Class<R>,
  expected: R[],
) {
  for (const x of expected) {
    expect(await oso.isAllowed(actor, action, x)).toBe(true);
  }

  const actual = await oso.authorizedResources(actor, action, resource);

  expect(actual).toHaveLength(expected.length);
  expect(actual).toEqual(expect.arrayContaining(expected));
}
