import {testEnforcerBatch} from '@bleco/acl/dist/test';
import {OsoComponent} from '../../oso.component';
import {spyOnAdapter} from '../support';
import {DefaultRepositoryFactoryProvider, RepositoryFactoryBindings} from '@bleco/repository-factory';
import {BindingScope} from '@loopback/core';

describe('OsoEnforcer', function () {
  testEnforcerBatch(app => {
    app
      .bind(RepositoryFactoryBindings.REPOSITORY_FACTORY)
      .toProvider(DefaultRepositoryFactoryProvider)
      .inScope(BindingScope.SINGLETON);
    app.component(OsoComponent);
    spyOnAdapter(app);
  });
});
