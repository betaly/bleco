import {RepositoryFactory} from '@bleco/repository-factory';
import {BindingScope, inject, injectable, Provider} from '@loopback/context';
import {EnforcerStrategy} from '../../../dist';
import {Enforcer} from '../../enforcer';
import {AclBindings} from '../../keys';
import {PolicyRegistry} from '../../policies';
import {DefaultEnforcerOptions, DefaultEnhancer} from './index';

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

  value(): EnforcerStrategy {
    return new DefaultEnhancer(this.policyRegistry, this.repositoryFactory, this.options);
  }
}
