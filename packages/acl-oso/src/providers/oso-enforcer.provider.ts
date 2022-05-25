import {BindingScope, inject, Provider} from '@loopback/context';
import {AclBindings, EnforcerStrategy, PolicyManager} from '@bleco/acl';
import {EnforcerOptions, OsoEnforcer} from '../oso.enforcer';
import {OsoBindings} from '../keys';
import {OsoPolicyBuilder} from '../policy-builder';
import {JugglerAdapter, RepositoryFactory} from 'oso-juggler';
import debugFactory from 'debug';
import {injectable} from '@loopback/core';

const debug = debugFactory('bleco:oso:enforcer');

@injectable({scope: BindingScope.SINGLETON})
export class OsoEnforcerProvider implements Provider<EnforcerStrategy> {
  constructor(
    @inject(AclBindings.POLICY_MANAGER)
    private policyManager: PolicyManager,
    @inject(OsoBindings.REPOSITORY_FACTORY)
    private repositoryFactory: RepositoryFactory,
    @inject(OsoBindings.CONFIG, {optional: true})
    private options?: EnforcerOptions,
  ) {}

  async value(): Promise<EnforcerStrategy> {
    const builder = new OsoPolicyBuilder(this.policyManager);
    const enforcer = new OsoEnforcer(this.options);
    // set data filter
    enforcer.setDataFilteringAdapter(new JugglerAdapter(this.repositoryFactory));
    // register classes
    for (const [, entry] of builder.models) {
      enforcer.registerModel(entry.model, entry.fields);
    }
    const polar = await builder.generatePolar();
    debug('Load Polar:');
    debug(polar);
    await enforcer.loadStr(polar);
    return enforcer;
  }
}
