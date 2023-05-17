import {Application, Component, CoreBindings, ProviderMap, inject} from '@loopback/core';

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
    NotificationAliaser.apply(app);
    // alias notification providers config
    NotificationProvidersAliaser.apply(app);
  }
}
