import {Application} from '@loopback/core';
import {RestComponent} from '@loopback/rest';

import {AuthenticationComponent} from '../../../../component';
import {AuthenticationBindings} from '../../../../keys';
import {StrategiesOptions} from '../../../../strategies';

/**
 *Gives an instance of application
 */
export function getApp(auth?: StrategiesOptions): Application {
  const app = new Application({auth});
  app.bind(AuthenticationBindings.CONFIG).to({
    useClientAuthenticationMiddleware: true,
    useUserAuthenticationMiddleware: true,
  });
  app.component(AuthenticationComponent);
  app.component(RestComponent);
  return app;
}
