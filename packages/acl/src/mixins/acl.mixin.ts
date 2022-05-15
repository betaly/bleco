import {Application, Binding, MixinTarget} from '@loopback/core';
import debugFactory from 'debug';
import {AclComponent} from '../component';
import {Policy} from '../policy';
import {AclBindings, AclTags} from '../keys';
import {Class} from 'tily/typings/types';
import {Entity} from '@loopback/repository';

const debug = debugFactory('bleco:acl:mixin');

export function AclMixin<T extends MixinTarget<Application>>(superClass: T) {
  return class extends superClass {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.component(AclComponent);
    }

    policy(policy: Policy) {
      const binding = createPolicyBinding(policy);
      this.add(binding);
      return binding;
    }

    async findPolicy(model: Class<Entity> | string): Promise<Policy | undefined> {
      const name = typeof model === 'string' ? model : model.name;
      const binding = this.getBinding(`${AclBindings.POLICIES}.${name}`, {optional: true});
      if (binding) {
        return this.get(binding.key);
      }
    }

    getPolicy(model: Class<Entity> | string): Promise<Policy> {
      const name = typeof model === 'string' ? model : model.name;
      return this.get(`${AclBindings.POLICIES}.${name}`);
    }
  };
}

export interface ApplicationWithAcl extends Application {
  policy(policy: Policy): Binding<Policy>;

  findPolicy(model: Class<Entity> | string): Promise<Policy | undefined>;

  getPolicy(model: Class<Entity> | string): Promise<Policy>;
}

/**
 * Create a binding for the given model class
 * @param policy - Policy object
 */
export function createPolicyBinding(policy: Policy) {
  return Binding.bind<Policy>(`${AclBindings.POLICIES}.${policy.model.name}`).to(policy).tag(AclTags.POLICY);
}
