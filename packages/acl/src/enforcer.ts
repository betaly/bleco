import {Class} from 'tily/typings/types';
import {Entity} from '@loopback/repository';
import {ResourceFilter} from './types';

export interface Enforcer<Actor extends Entity = Entity, Resource extends Entity = Entity> {
  /**
   * Query the knowledge base to determine whether an actor is allowed to
   * perform an action upon a resource.
   *
   * @param actor Subject.
   * @param action Verb.
   * @param resource Object.
   * @returns An access control decision.
   */
  isAllowed(actor: Actor, action: string, resource: Resource): Promise<boolean>;

  /**
   * Ensure that `actor` is allowed to perform `action` on
   * `resource`.
   *
   * If the action is permitted with an `allow` rule in the policy, then
   * this method returns `None`. If the action is not permitted by the
   * policy, this method will raise an error.
   *
   * The error raised by this method depends on whether the actor can perform
   * the `"read"` action on the resource. If they cannot read the resource,
   * then a `NotFound` error is raised. Otherwise, a `ForbiddenError` is
   * raised.
   *
   * @param actor The actor performing the request.
   * @param action The action the actor is attempting to perform.
   * @param resource The resource being accessed.
   * @param options
   * @param options.checkRead If set to `false`, a `ForbiddenError` is always
   *   thrown on authorization failures, regardless of whether the actor can
   *   read the resource. Default is `true`.
   */
  authorize(
    actor: Actor,
    action: string,
    resource: Resource,
    options?: {
      checkRead?: boolean;
    },
  ): Promise<void>;

  /**
   * Determine the actions `actor` is allowed to take on `resource`.
   *
   * Collects all actions allowed by allow rules in the Polar policy for the
   * given combination of actor and resource.
   *
   * @param actor The actor for whom to collect allowed actions
   * @param resource The resource being accessed
   * @param options
   * @param options.allowWildcard Flag to determine behavior if the policy
   *   includes a wildcard action. E.g., a rule allowing any action:
   *   `allow(_actor, _action, _resource)`. If `true`, the method will
   *   return `["*"]`, if `false`, the method will raise an exception.
   * @returns A list of the unique allowed actions.
   */
  authorizedActions(
    actor: Actor,
    resource: Resource,
    options?: {
      allowWildcard?: boolean;
    },
  ): Promise<Set<string | '*'>>;

  /**
   * Ensure that `actor` is allowed to perform `action` on a given
   * `resource`'s `field`.
   *
   * If the action is permitted by an `allow_field` rule in the policy,
   * then this method returns nothing. If the action is not permitted by the
   * policy, this method will raise a `ForbiddenError`.
   *
   * @param actor The actor performing the request.
   * @param action The action the actor is attempting to perform on the
   * field.
   * @param resource The resource being accessed.
   * @param field The name of the field being accessed.
   */
  authorizeField(actor: Actor, action: string, resource: Resource, field: string): Promise<void>;

  /**
   * Determine the fields of `resource` on which `actor` is allowed to
   * perform  `action`.
   *
   * Uses `allow_field` rules in the policy to find all allowed fields.
   *
   * @param actor The actor for whom to collect allowed fields.
   * @param action The action being taken on the field.
   * @param resource The resource being accessed.
   * @param options
   * @param options.allowWildcard Flag to determine behavior if the policy \
   *   includes a wildcard field. E.g., a rule allowing any field: \
   *   `allow_field(_actor, _action, _resource, _field)`. If `true`, the \
   *   method will return `["*"]`, if `false`, the method will raise an \
   *   exception.
   * @returns A list of the unique allowed fields.
   */
  authorizedFields(
    actor: Actor,
    action: string,
    resource: Resource,
    options?: {
      allowWildcard?: boolean;
    },
  ): Promise<Set<string | '*'>>;

  /**
   * Create a query for all the resources of type `resourceCls` that `actor` is
   * allowed to perform `action` on.
   *
   * @param actor Subject.
   * @param action Verb.
   * @param resourceCls Object type.
   * @returns A query that selects authorized resources of type `resourceCls`
   */
  authorizedQuery(actor: Actor, action: string, resourceCls: Class<Resource>): Promise<ResourceFilter>;

  /**
   * Determine the resources of type `resourceCls` that `actor`
   * is allowed to perform `action` on.
   *
   * @param actor Subject.
   * @param action Verb.
   * @param resourceCls Object type.
   * @returns An array of authorized resources.
   */
  authorizedResources(actor: Actor, action: string, resourceCls: Class<Resource>): Promise<Resource[]>;
}
