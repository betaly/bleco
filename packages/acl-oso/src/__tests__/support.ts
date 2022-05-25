import {Application} from '@loopback/core';
import {AclBindings} from '@bleco/acl';
import {OsoEnforcer} from '../oso.enforcer';

const debug = require('debug')('bleco:oso:test');

export function patchRules(app: Application, polices: Record<string, string[]>) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.once('booted', async () => {
    const policyManager = await app.get(AclBindings.POLICY_MANAGER);
    for (const [name, rules] of Object.entries(polices)) {
      const policy = policyManager.get(name);
      policy.rules = policy.rules ?? {};
      policy.rules.oso = rules;
    }
  });
}

export function spyOnAdapter(app: Application) {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.once('booted', async () => {
    const enforcer = await app.get<OsoEnforcer>(AclBindings.ENFORCER_STRATEGY);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adapter = (enforcer as any).getHost().adapter;

    const executeQuery = adapter.executeQuery;
    adapter.executeQuery = async (query: string) => {
      const result = await executeQuery.call(enforcer.getHost().adapter, query);
      debug('Query Result: %o', result);
      return result;
    };
  });
}
