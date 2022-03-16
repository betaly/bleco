import {Binding, Component, inject, ProviderMap} from '@loopback/core';

import {AuthorizationBindings} from './keys';
import {
  AuthorizationMetadataProvider,
  AuthorizeActionProvider,
  CasbinAuthorizationProvider,
  UserPermissionsProvider,
} from './providers';
import {AuthorizationOptions} from './types';

export class AuthorizationComponent implements Component {
  providers?: ProviderMap;
  bindings?: Binding[];

  constructor(
    @inject(AuthorizationBindings.OPTIONS)
    private readonly options?: AuthorizationOptions,
  ) {
    this.providers = {
      [AuthorizationBindings.AUTHORIZE_ACTION.key]: AuthorizeActionProvider,
      [AuthorizationBindings.CASBIN_AUTHORIZE_ACTION.key]: CasbinAuthorizationProvider,
      [AuthorizationBindings.METADATA.key]: AuthorizationMetadataProvider,
      [AuthorizationBindings.USER_PERMISSIONS.key]: UserPermissionsProvider,
    };

    if (this.options?.allowAlwaysPaths && this.options?.allowAlwaysPaths?.length > 0) {
      this.bindings = [Binding.bind(AuthorizationBindings.PATHS_TO_ALLOW_ALWAYS).to(this.options.allowAlwaysPaths)];
    } else {
      this.bindings = [Binding.bind(AuthorizationBindings.PATHS_TO_ALLOW_ALWAYS).to(['/explorer'])];
    }
  }
}
