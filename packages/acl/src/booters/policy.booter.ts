import {ArtifactOptions, BaseArtifactBooter, BootBindings, booter} from '@bleco/boot';
import {config, inject} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import debugFactory from 'debug';
import {ApplicationWithAcl} from '../mixins/acl.mixin';
import {isPolicy} from '../policy';

const debug = debugFactory('bleco:acl:policy-booter');

/**
 * A class that extends BaseArtifactBooter to boot the Acl policy artifact type.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of user's project relative to which all paths are resolved
 * @param bootConfig - Connection artifact options object
 */
@booter('policies')
export class AclPolicyBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: ApplicationWithAcl,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public entityConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set TypeORM connection options if passed in via bootConfig
      Object.assign({}, PolicyDefaults, entityConfig),
    );
  }

  async load() {
    for (const file of this.discovered) {
      if (!this.app.policy) {
        console.warn(
          'app.policy() function is needed for AclPolicyBooter. You can add it to your Application using AclMixin from @bleco/acl.',
        );
      } else {
        const policies = require(file);
        for (const k in policies) {
          const policy = policies[k];
          if (isPolicy(policy)) {
            debug('Bind policy: %s', policy.model.name);
            this.app.policy(policy);
          }
        }
      }
    }
  }
}

export const PolicyDefaults: ArtifactOptions = {
  dirs: ['policies'],
  extensions: ['.policy.[jt]s'],
  nested: true,
};
