import {BindingKey} from '@loopback/core';
import * as ali from '@alicloud/openapi-client';

export namespace AliSMSBindings {
  export const Config = BindingKey.create<ali.Config | null>('bleco.notification.config.alisms');
}
