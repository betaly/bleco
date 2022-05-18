import {Application, Binding, MixinTarget} from '@loopback/core';
import debugFactory from 'debug';
import {AclComponent} from '../component';
import {Policy} from '../policy';
import {AclBindings, AclTags} from '../keys';
import {Class} from 'tily/typings/types';
import {Entity} from '@loopback/repository';
import {PolicyManager} from '../policy.manager';

const debug = debugFactory('bleco:acl:mixin');

export function AclMixin<T extends MixinTarget<Application>>(superClass: T) {
  return class extends superClass {
    policyManager: PolicyManager;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.component(AclComponent);
      this.policyManager = new PolicyManager();
      const binding: Binding<PolicyManager> = this.bind(AclBindings.POLICY_MANAGER).to(this.policyManager);
      debug('Binding created for policy manager', binding);
    }

    policy(policy: Policy) {
      this.policyManager.add(policy);
      const name = policy.model.name;
      const binding: Binding<Policy> = this.bind(`${AclBindings.POLICIES}.${name}`)
        .toDynamicValue(() => this.policyManager.get(name))
        .tag(AclTags.POLICY);
      this.add(binding);
      return binding;
    }

    findPolicy(model: Class<Entity> | string): Policy | undefined {
      const name = typeof model === 'string' ? model : model.name;
      return this.policyManager.find(name);
    }

    getPolicy(model: Class<Entity> | string): Policy {
      const name = typeof model === 'string' ? model : model.name;
      return this.policyManager.get(name);
    }
  };
}

export interface ApplicationWithAcl extends Application {
  policy(policy: Policy): Binding<Policy>;

  findPolicy(model: Class<Entity> | string): Policy | undefined;

  getPolicy(model: Class<Entity> | string): Policy;
}
