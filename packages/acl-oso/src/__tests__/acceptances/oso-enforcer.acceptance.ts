import {testEnforcerBatch} from '@bleco/acl/dist/test';
import {OsoComponent} from '../../oso.component';
import {spyOnAdapter} from '../support';

describe('OsoEnforcer', function () {
  testEnforcerBatch(app => {
    app.component(OsoComponent);
    // patchRules(app, rules);
    spyOnAdapter(app);
  });
});
