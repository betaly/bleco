import {Application, Binding, BindingFromClassOptions, Constructor, CoreBindings, MixinTarget} from '@loopback/core';
import {Class} from 'tily/typings/types';
import {Entity} from '@loopback/repository';
import debugFactory from 'debug';
import {AclComponent} from '../component';
import {Policy} from '../policy';
import {AclBindings, AclTags} from '../keys';
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

    /**
     * Add a component to this application. Also mounts
     * all the components policies.
     *
     * @param componentCtor - The component to add.
     * @param nameOrOptions - Name or options for the binding.
     *
     * @example
     * ```ts
     *
     * export class ProductComponent {
     *   controllers = [ProductController];
     *   policies = [ProductPolicy, UserPolicy];
     *   providers = {
     *     [AUTHENTICATION_STRATEGY]: AuthStrategy,
     *     [AUTHORIZATION_ROLE]: Role,
     *   };
     * };
     *
     * app.component(ProductComponent);
     * ```
     */
    // Unfortunately, TypeScript does not allow overriding methods inherited
    // from mapped types. https://github.com/microsoft/TypeScript/issues/38496
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    public component<C extends Component = Component>(
      componentCtor: Constructor<C>,
      nameOrOptions?: string | BindingFromClassOptions,
    ) {
      const binding = super.component(componentCtor, nameOrOptions);
      const instance = this.getSync<C & AclComponent>(binding.key);
      this.mountComponentPolicies(instance);
      return binding;
    }

    /**
     * Get an instance of a component and mount all it's
     * policies. This function is intended to be used internally
     * by `component()`.
     *
     * NOTE: Calling `mountComponentRepositories` with a component class
     * constructor is deprecated. You should instantiate the component
     * yourself and provide the component instance instead.
     *
     * @param componentInstanceOrClass - The component to mount repositories of
     * @internal
     */
    mountComponentPolicies(
      // accept also component class to preserve backwards compatibility
      // TODO(semver-major) Remove support for component class constructor
      componentInstanceOrClass: Class<unknown> | PolicyComponent,
    ) {
      const component = resolveComponentInstance(this);

      if (component.policies) {
        for (const policy of component.policies) {
          this.policy(policy);
        }
      }

      // `Readonly<Application>` is a hack to remove protected members
      // and thus allow `this` to be passed as a value for `ctx`
      function resolveComponentInstance(ctx: Readonly<Application>) {
        if (typeof componentInstanceOrClass !== 'function') return componentInstanceOrClass;

        const componentName = componentInstanceOrClass.name;
        const componentKey = `${CoreBindings.COMPONENTS}.${componentName}`;
        return ctx.getSync<PolicyComponent>(componentKey);
      }
    }
  };
}

/**
 * This interface describes additional Component properties
 * allowing components to contribute Polacy-related artifacts.
 */
export interface PolicyComponent {
  /**
   * An optional list of Policy instances to bind for dependency injection
   * via `app.policy()` API.
   */
  policies?: Policy[];
}

export interface ApplicationWithAcl extends Application {
  policy(policy: Policy): Binding<Policy>;

  findPolicy(model: Class<Entity> | string): Policy | undefined;

  getPolicy(model: Class<Entity> | string): Policy;
}
