import {BindingKey} from '@loopback/context';
import {OsoAuthorizer, OsoAuthorizerOptions} from './oso.authorizer';
import {OsoComponent} from './oso.component';

export namespace OsoBindings {
  export const COMPONENT = BindingKey.create<OsoComponent>('components.OsoComponent');
  export const CONFIG = BindingKey.create<OsoAuthorizerOptions>('oso.config');
  export const ADAPTER = BindingKey.create<OsoAuthorizerOptions>('oso.adapter');
  export const AUTHORIZER = BindingKey.create<OsoAuthorizer>('oso.authorizer');
}
