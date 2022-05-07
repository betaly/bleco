import {
  Application,
  BindingScope,
  Component,
  ContextTags,
  CoreBindings,
  createBindingFromClass,
  inject,
  injectable,
} from '@loopback/core';
import {Enforcer} from './enforcer';
import {OsoBindings} from './keys';
import {OsoAliaser} from './alias';

@injectable({tags: {[ContextTags.KEY]: OsoBindings.COMPONENT.key}})
export class OsoComponent implements Component {
  bindings = [createBindingFromClass(Enforcer, {key: OsoBindings.ENFORCER, defaultScope: BindingScope.SINGLETON})];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,
  ) {
    OsoAliaser.alias(app);

    app.once('booted', () => this.boot());
  }

  boot() {
    // register classes
    //
  }
}
