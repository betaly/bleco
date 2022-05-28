import {AclBindings} from '@bleco/acl';
import {Application, Component, ContextTags, CoreBindings, inject, injectable, ProviderMap} from '@loopback/core';
import {DefaultRepositoryFactoryProvider, RepositoryFactoryBindings} from '@bleco/repository-factory';
import {OsoBindings} from './keys';
import {OsoAliaser} from './alias';
import {OsoEnforcerProvider} from './providers';

@injectable({tags: {[ContextTags.KEY]: OsoBindings.COMPONENT.key}})
export class OsoComponent implements Component {
  providers: ProviderMap = {
    [AclBindings.ENFORCER_STRATEGY.key]: OsoEnforcerProvider,
    [RepositoryFactoryBindings.REPOSITORY_FACTORY.key]: DefaultRepositoryFactoryProvider,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    readonly app: Application,
  ) {
    OsoAliaser.alias(app);
  }
}
