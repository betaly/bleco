import {BindingKey} from '@loopback/context';

import {Interaction} from './oidc';
import {OidpComponent} from './oidp.component';
import {AdapterFactory, FindAccount, LoadExistingGrant, OidcProvider, OidpConfig} from './types';

export namespace OidpBindings {
  export const COMPONENT = BindingKey.create<OidpComponent>('components.OidpComponent');
  export const CONFIG = BindingKey.create<OidpConfig>('oidp.config');
  export const OIDC_PROVIDER = BindingKey.create<OidcProvider>('oidp.provider');
  export const INTERACTION = BindingKey.create<Interaction>('oidp.interaction');
  export const ADAPTER_FACTORY = BindingKey.create<AdapterFactory>('oidp.adapterFactory');
  export const FIND_ACCOUNT = BindingKey.create<FindAccount>('oidp.findAccount');
  export const LOAD_EXISTING_GRANT = BindingKey.create<LoadExistingGrant>('oidp.loadExistingGrant');
}
