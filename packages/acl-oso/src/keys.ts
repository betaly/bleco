import {BindingKey} from '@loopback/context';
import {OsoComponent} from './oso.component';
import {EnforcerOptions} from './oso.enforcer';

export namespace OsoBindings {
  export const COMPONENT = BindingKey.create<OsoComponent>('components.OsoComponent');
  export const CONFIG = BindingKey.create<EnforcerOptions>('oso.config');
}
