import {Class} from 'tily/typings/types';
import {Entity} from '@loopback/repository';
import {QueryWhere} from '@bleco/query';

export interface AuthorizedFilter<T extends Entity = Entity> {
  model: string;
  where: QueryWhere<T>;
}

export interface Enforcer<Actor extends Entity = Entity, Resource extends Entity = Entity> {
  /**
   * Query the knowledge base to determine whether an principal is allowed to
   * perform an action upon a resource.
   *
   * @param principal Subject.
   * @param action Verb.
   * @param resource Object.
   * @returns An access control decision.
   */
  isAllowed(principal: Actor, action: string, resource: Resource): Promise<boolean>;

  /**
   * Ensure that `principal` is allowed to perform `action` on
   * `resource`.
   *
   * If the action is permitted with an `allow` rule in the policy, then
   * this method returns `None`. If the action is not permitted by the
   * policy, this method will raise an error.
   *
   * The error raised by this method depends on whether the principal can perform
   * the `"read"` action on the resource. If they cannot read the resource,
   * then a `NotFound` error is raised. Otherwise, a `ForbiddenError` is
   * raised.
   *
   * @param principal The principal performing the request.
   * @param action The action the principal is attempting to perform.
   * @param resource The resource being accessed.
   * @param options
   * @param options.checkRead If set to `false`, a `ForbiddenError` is always
   *   thrown on authorization failures, regardless of whether the principal can
   *   read the resource. Default is `true`.
   */
  authorize(
    principal: Actor,
    action: string,
    resource: Resource,
    options?: {
      checkRead?: boolean;
    },
  ): Promise<void>;

  /**
   * Determine the actions `principal` is allowed to take on `resource`.
   *
   * Collects all actions allowed by allow rules in the Polar policy for the
   * given combination of principal and resource.
   *
   * @param principal The principal for whom to collect allowed actions
   * @param resource The resource being accessed
   * @param options
   * @param options.allowWildcard Flag to determine behavior if the policy
   *   includes a wildcard action. E.g., a rule allowing any action:
   *   `allow(_actor, _action, _resource)`. If `true`, the method will
   *   return `["*"]`, if `false`, the method will raise an exception.
   * @returns A list of the unique allowed actions.
   */
  authorizedActions(
    principal: Actor,
    resource: Resource,
    options?: {
      allowWildcard?: boolean;
    },
  ): Promise<Set<string | '*'>>;

  /**
   * Ensure that `principal` is allowed to perform `action` on a given
   * `resource`'s `field`.
   *
   * If the action is permitted by an `allow_field` rule in the policy,
   * then this method returns nothing. If the action is not permitted by the
   * policy, this method will raise a `ForbiddenError`.
   *
   * @param principal The principal performing the request.
   * @param action The action the principal is attempting to perform on the
   * field.
   * @param resource The resource being accessed.
   * @param field The name of the field being accessed.
   */
  authorizeField(principal: Actor, action: string, resource: Resource, field: string): Promise<void>;

  /**
   * Determine the fields of `resource` on which `principal` is allowed to
   * perform  `action`.
   *
   * Uses `allow_field` rules in the policy to find all allowed fields.
   *
   * @param principal The principal for whom to collect allowed fields.
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
    principal: Actor,
    action: string,
    resource: Resource,
    options?: {
      allowWildcard?: boolean;
    },
  ): Promise<Set<string | '*'>>;

  /**
   * Create a query for all the resources of type `resourceCls` that `principal` is
   * allowed to perform `action` on.
   *
   * @param principal Subject.
   * @param action Verb.
   * @param resourceCls Object type.
   * @returns A query that selects authorized resources of type `resourceCls`
   */
  authorizedQuery(principal: Actor, action: string, resourceCls: Class<Resource>): Promise<AuthorizedFilter>;

  /**
   * Determine the resources of type `resourceCls` that `principal`
   * is allowed to perform `action` on.
   *
   * @param principal Subject.
   * @param action Verb.
   * @param resourceCls Object type.
   * @returns An array of authorized resources.
   */
  authorizedResources(principal: Actor, action: string, resourceCls: Class<Resource>): Promise<Resource[]>;
}

export interface EnforcerStrategy extends Enforcer {
  /**
   * The 'name' property is a unique identifier for the
   * enforcer strategy ( for example : 'basic', 'oso', etc)
   */
  name: string;
}
