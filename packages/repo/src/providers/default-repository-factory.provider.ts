import {BindingScope, Provider, inject, injectable} from '@loopback/context';
import {Application, CoreBindings} from '@loopback/core';

import {DefaultRepositoryFactory, RepositoryFactory} from '../factories';

@injectable({scope: BindingScope.SINGLETON})
export class DefaultRepositoryFactoryProvider implements Provider<RepositoryFactory> {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected app: Application,
  ) {}

  async value(): Promise<RepositoryFactory> {
    const factory = new DefaultRepositoryFactory(this.app);
    await factory.discover();
    return factory;
  }
}
