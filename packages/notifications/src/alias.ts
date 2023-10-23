import {Aliaser} from '@bleco/aliaser';

import {NotificationBindings} from './keys';

export const NotificationAliaser = Aliaser.create({
  notifications: NotificationBindings.Config,
});
