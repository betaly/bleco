import {BindingKey} from '@loopback/context';
import {RepositoryFactory} from './factories';

export namespace RepositoryFactoryBindings {
  export const REPOSITORY_FACTORY = BindingKey.create<RepositoryFactory>('repository-factory');
}
