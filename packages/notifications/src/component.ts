import {Application, Component, CoreBindings, inject, ProviderMap} from '@loopback/core';
import {NotificationAliaser} from './alias';
import {NotificationBindings} from './keys';
import {NotificationProvider, NotificationProvidersAliaser} from './providers';

export class NotificationsComponent implements Component {
  providers?: ProviderMap = {
    [NotificationBindings.NotificationProvider.key]: NotificationProvider,
  };

  // Take over by aliaser
  // bindings?: Binding[] = [
  //   Binding.bind(NotificationBindings.Config.key).to(null),
  //   Binding.bind(SESBindings.Config.key).to(null),
  //   Binding.bind(SNSBindings.Config.key).to(null),
  //   Binding.bind(PubnubBindings.Config.key).to(null),
  //   Binding.bind(SocketBindings.Config.key).to(null),
  // ];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,
  ) {
    // alias notification config
    NotificationAliaser.alias(app);
    // alias notification providers config
    NotificationProvidersAliaser.alias(app);
  }
}
