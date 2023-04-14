import {BindingKey} from '@loopback/context';

import {RepositoryFactory} from './factories';

export namespace RepoBindings {
  export const REPOSITORY_FACTORY = BindingKey.create<RepositoryFactory>('repository-factory');
}
