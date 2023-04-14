import {Binding, Component, ProviderMap, inject} from '@loopback/core';

import {AuthorizationBindings} from './keys';
import {
  AuthorizationMetadataProvider,
  AuthorizeActionProvider,
  CasbinAuthorizationProvider,
  UserPermissionsProvider,
} from './providers';
import {AuthorizationConfig} from './types';

export class AuthorizationComponent implements Component {
  providers?: ProviderMap;
  bindings?: Binding[];

  constructor(
    @inject(AuthorizationBindings.CONFIG)
    private readonly config?: AuthorizationConfig,
  ) {
    this.providers = {
      [AuthorizationBindings.AUTHORIZE_ACTION.key]: AuthorizeActionProvider,
      [AuthorizationBindings.CASBIN_AUTHORIZE_ACTION.key]: CasbinAuthorizationProvider,
      [AuthorizationBindings.METADATA.key]: AuthorizationMetadataProvider,
      [AuthorizationBindings.USER_PERMISSIONS.key]: UserPermissionsProvider,
    };

    if (this.config?.allowAlwaysPaths && this.config?.allowAlwaysPaths?.length > 0) {
      this.bindings = [Binding.bind(AuthorizationBindings.PATHS_TO_ALLOW_ALWAYS).to(this.config.allowAlwaysPaths)];
    } else {
      this.bindings = [Binding.bind(AuthorizationBindings.PATHS_TO_ALLOW_ALWAYS).to(['/explorer'])];
    }
  }
}
