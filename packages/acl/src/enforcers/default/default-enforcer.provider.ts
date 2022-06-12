import {RepositoryFactory} from '@bleco/repo';
import {BindingScope, inject, injectable, Provider} from '@loopback/context';
import {Enforcer} from '../../enforcer';
import {AclBindings} from '../../keys';
import {PolicyRegistry} from '../../policies';
import {DefaultEnforcerOptions, DefaultEnhancer} from './default-enforcer';

@injectable({scope: BindingScope.SINGLETON})
export class DefaultEnforcerProvider implements Provider<Enforcer> {
  constructor(
    @inject(AclBindings.POLICY_REGISTRY)
    readonly policyRegistry: PolicyRegistry,
    @inject(AclBindings.REPOSITORY_FACTORY)
    readonly repositoryFactory: RepositoryFactory,
    @inject(AclBindings.DEFAULT_ENFORCER_OPTIONS, {optional: true})
    readonly options: DefaultEnforcerOptions = {},
  ) {}

  value(): Enforcer {
    return new DefaultEnhancer(this.policyRegistry, this.repositoryFactory, this.options);
  }
}
