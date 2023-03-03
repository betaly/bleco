import {Application} from '@loopback/core';
import {RestComponent} from '@loopback/rest';
import {AuthenticationComponent} from '../../../../component';
import {AuthenticationBindings} from '../../../../keys';

/**
 *Gives an instance of application
 */
export function getApp(): Application {
  const app = new Application();
  app.bind(AuthenticationBindings.CONFIG).to({
    useClientAuthenticationMiddleware: true,
    useUserAuthenticationMiddleware: true,
  });
  app.component(AuthenticationComponent);
  app.component(RestComponent);
  return app;
}
