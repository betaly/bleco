/* eslint-disable @typescript-eslint/no-explicit-any */
import {isConstructor} from 'tily/is/constructor';
import {RestApplication} from '@loopback/rest';
import {Context} from '@loopback/context';
import {Entity, EntityCrudRepository} from '@loopback/repository';
import {createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';
import {Class} from 'oso/dist/src/types';
import {OsoApp} from './application';
import {OsoAuthorizer} from '../../oso.authorizer';

export class ContextHelper {
  constructor(public context: Context) {}

  async repository<T extends EntityCrudRepository<any, any>>(nameOrClass: string | Class<T>): Promise<T> {
    const name = isConstructor(nameOrClass) ? nameOrClass.name : nameOrClass;
    return (await this.context.get(`repositories.${name}`)) as T;
  }
}

export async function givenAppAndClient() {
  const app = new OsoApp({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app as RestApplication);
  return {app, client};
}

export async function givenApp(migrate?: boolean) {
  const app = new OsoApp({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.migrateSchema(migrate ? {existingSchema: 'drop'} : {});
  await app.start();
  return app;
}

export async function checkAuthz<A = unknown, R extends Entity = Entity>(
  oso: OsoAuthorizer<A, unknown, R>,
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
