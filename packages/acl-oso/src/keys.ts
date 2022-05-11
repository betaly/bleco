import {BindingKey} from '@loopback/context';
import {Enforcer, EnforcerOptions} from './enforcer';
import {OsoComponent} from './oso.component';
import {OsoPolicy} from './types';

export namespace OsoBindings {
  export const COMPONENT = BindingKey.create<OsoComponent>('components.OsoComponent');
  export const CONFIG = BindingKey.create<EnforcerOptions>('oso.config');
  export const ADAPTER = BindingKey.create<EnforcerOptions>('oso.adapter');
  export const ENFORCER = BindingKey.create<Enforcer>('oso.enforcer');

  export const POLICY = BindingKey.create<OsoPolicy>('oso.policy');
}
