import {Application, Component, CoreBindings, inject, ProviderMap} from '@loopback/core';

import {NotificationAliaser} from './alias';
import {NotificationBindings} from './keys';
import {NotificationProvider, NotificationProvidersAliaser} from './providers';

export class NotificationsComponent implements Component {
  providers?: ProviderMap = {
    [NotificationBindings.NotificationProvider.key]: NotificationProvider,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,
  ) {
    // alias notification config
    NotificationAliaser.apply(app);
    // alias notification providers config
    NotificationProvidersAliaser.apply(app);
  }
}
