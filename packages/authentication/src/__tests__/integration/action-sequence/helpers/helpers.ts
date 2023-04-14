import {Application} from '@loopback/core';
import {RestComponent} from '@loopback/rest';

import {AuthenticationComponent} from '../../../../component';

/**
 *Gives an instance of application
 */
export function getApp(): Application {
  const app = new Application();
  app.component(AuthenticationComponent);
  app.component(RestComponent);
  return app;
}
