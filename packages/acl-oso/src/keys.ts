import {BindingKey} from '@loopback/context';
import {EnforcerOptions} from './oso.enforcer';
import {OsoComponent} from './oso.component';
import {RepositoryFactory} from 'oso-juggler';

export namespace OsoBindings {
  export const COMPONENT = BindingKey.create<OsoComponent>('components.OsoComponent');
  export const CONFIG = BindingKey.create<EnforcerOptions>('oso.config');
  export const REPOSITORY_FACTORY = BindingKey.create<RepositoryFactory>('oso.repository-factory');
}
