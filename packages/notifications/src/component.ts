import {Application, Component, CoreBindings, inject, ProviderMap} from '@loopback/core';

import {NotificationAliaser} from './alias';
import {NotificationBindings} from './keys';
import {NotificationProvidersAliaser} from './providers/alias';
import {NotificationProvider} from './providers/notification.provider';

export class NotificationsComponent implements Component {
  providers?: ProviderMap = {
    [NotificationBindings.NotificationProvider.key]: NotificationProvider,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,
  ) {
    // alias notification config
    NotificationAliaser.bind(app);
    // alias notification providers config
    NotificationProvidersAliaser.bind(app);
  }
}
