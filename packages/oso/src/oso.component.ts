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
import {OsoAuthorizer} from './oso.authorizer';
import {OsoBindings} from './keys';
import {OsoAliaser} from './alias';

@injectable({tags: {[ContextTags.KEY]: OsoBindings.COMPONENT.key}})
export class OsoComponent implements Component {
  bindings = [
    createBindingFromClass(OsoAuthorizer, {key: OsoBindings.AUTHORIZER, defaultScope: BindingScope.SINGLETON}),
  ];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    app: Application,
  ) {
    OsoAliaser.alias(app);
  }
}
