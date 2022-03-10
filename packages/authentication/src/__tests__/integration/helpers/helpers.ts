import {Application, ApplicationConfig} from '@loopback/core';
import {AuthenticationComponent} from '../../../component';
import {RestComponent} from '@loopback/rest';

/**
 *Gives an instance of application
 */
export function givenApp(options?: ApplicationConfig): Application {
  const app = new Application(options);
  app.component(AuthenticationComponent);
  app.component(RestComponent);
  return app;
}
