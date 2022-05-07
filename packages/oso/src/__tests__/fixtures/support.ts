/* eslint-disable @typescript-eslint/no-explicit-any */
import {isConstructor} from 'tily/is/constructor';
import {RestApplication} from '@loopback/rest';
import {Context} from '@loopback/context';
import {EntityCrudRepository} from '@loopback/repository';
import {createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';
import {Class} from 'tily/typings/types';
import {GitClubApplication} from './application';

export class ContextHelper {
  constructor(public context: Context) {}

  async repository<T extends EntityCrudRepository<any, any>>(nameOrClass: string | Class<T>): Promise<T> {
    const name = isConstructor(nameOrClass) ? nameOrClass.name : nameOrClass;
    return (await this.context.get(`repositories.${name}`)) as T;
  }
}

export async function givenAppAndClient() {
  const app = new GitClubApplication({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app as RestApplication);
  return {app, client};
}

export async function givenApp(migrate?: boolean) {
  const app = new GitClubApplication({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.migrateSchema(migrate ? {existingSchema: 'drop'} : {});
  await app.start();
  return app;
}
