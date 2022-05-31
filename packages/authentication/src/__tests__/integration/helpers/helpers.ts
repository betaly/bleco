import {Application, ApplicationConfig} from '@loopback/core';
import {RestComponent} from '@loopback/rest';
import {AuthenticationComponent} from '../../../component';

/**
 *Gives an instance of application
 */
export function givenApp(options?: ApplicationConfig): Application {
  const app = new Application(options);
  app.component(AuthenticationComponent);
  app.component(RestComponent);
  return app;
}
