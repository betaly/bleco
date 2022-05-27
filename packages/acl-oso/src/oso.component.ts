import {Application, Component, ContextTags, CoreBindings, inject, injectable, ProviderMap} from '@loopback/core';
import {OsoBindings} from './keys';
import {OsoAliaser} from './alias';
import {AclBindings} from '@bleco/acl';
import {OsoEnforcerProvider} from './providers';

@injectable({tags: {[ContextTags.KEY]: OsoBindings.COMPONENT.key}})
export class OsoComponent implements Component {
  providers: ProviderMap = {
    [AclBindings.ENFORCER_STRATEGY.key]: OsoEnforcerProvider,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    readonly app: Application,
  ) {
    OsoAliaser.alias(app);
  }
}
