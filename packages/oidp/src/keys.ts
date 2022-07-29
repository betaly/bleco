import {BindingKey} from '@loopback/context';
import * as oidc from 'oidc-provider';
import {Interaction} from './oidc';
import {OidpComponent} from './oidp.component';
import {OidpConfig} from './types';

export namespace OidpBindings {
  export const COMPONENT = BindingKey.create<OidpComponent>('components.OidpComponent');
  export const CONFIG = BindingKey.create<OidpConfig>('oidp.config');
  export const PROVIDER = BindingKey.create<oidc.Provider>('oidp.provider');
  export const ADAPTER_FACTORY = BindingKey.create<oidc.AdapterFactory>('oidp.adapterFactory');
  export const INTERACTION = BindingKey.create<Interaction>('oidp.interaction');
  export const FIND_ACCOUNT = BindingKey.create<oidc.FindAccount>('oidp.findAccount');
}
