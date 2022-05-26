import {Application, ApplicationConfig} from '@loopback/core';
import {TestApplication} from './fixtures/application';

export async function givenApp<T extends Application>(options?: ApplicationConfig): Promise<TestApplication> {
  const app = new TestApplication(options);
  await app.boot();
  await app.start();
  return app;
}
