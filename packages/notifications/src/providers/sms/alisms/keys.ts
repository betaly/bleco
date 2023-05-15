import * as ali from '@alicloud/openapi-client';
import {BindingKey} from '@loopback/core';

export namespace AliSMSBindings {
  export const Config = BindingKey.create<ali.Config | null>('bleco.notification.config.alisms');
}
