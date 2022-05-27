import {isConstructor} from 'tily/is/constructor';
import {Context} from '@loopback/context';
import {Entity, EntityCrudRepository} from '@loopback/repository';
import {givenHttpServerConfig} from '@loopback/testlab';
import {Class} from 'oso/dist/src/types';
import {OsoApp} from './application';
import {Enforcer} from './enforcer';
import {RepositoryFactoryBindings} from '@bleco/repository-factory';

export class ContextHelper {
  constructor(public context: Context) {}

  async repository<T extends EntityCrudRepository<Entity, unknown>>(nameOrClass: string | Class<T>): Promise<T> {
    const name = isConstructor(nameOrClass) ? nameOrClass.name : nameOrClass;
    return (await this.context.get(`repositories.${name}`)) as T;
  }
}

export async function givenAppAndEnforcer() {
  const app = new OsoApp({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.migrateSchema({existingSchema: 'drop'});
  await app.start();

  const enforcer = new Enforcer(await app.get(RepositoryFactoryBindings.REPOSITORY_FACTORY));
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
