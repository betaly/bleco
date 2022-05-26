import {BindingKey} from '@loopback/context';
import {RepositoryFactory} from '@bleco/oso-juggler';
import {EnforcerOptions} from './oso.enforcer';
import {OsoComponent} from './oso.component';

export namespace OsoBindings {
  export const COMPONENT = BindingKey.create<OsoComponent>('components.OsoComponent');
  export const CONFIG = BindingKey.create<EnforcerOptions>('oso.config');
  export const REPOSITORY_FACTORY = BindingKey.create<RepositoryFactory>('oso.repository-factory');
}
