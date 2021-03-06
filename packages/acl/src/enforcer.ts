import {Entity, FilterExcludingWhere, Options, Where} from '@loopback/repository';
import {Constructor} from 'tily/typings/types';

export interface AuthorizedFilter<T extends Entity = Entity> {
  model: string;
  where: Where<T>;
}

export interface Enforcer<Principal extends Entity = Entity, Resource extends Entity = Entity> {
  /**
   * Query the knowledge base to determine whether an principal is allowed to
   * perform an action upon a resource.
   *
   * @param principal Subject.
   * @param action Verb.
   * @param resource Object.
   * @returns An access control decision.
   */
  isAllowed(principal: Principal, action: string, resource: Resource | string): Promise<boolean>;

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
    principal: Principal,
    action: string,
    resource: Resource | string,
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
    principal: Principal,
    resource: Resource | string,
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
  authorizeField(principal: Principal, action: string, resource: Resource | string, field: string): Promise<void>;

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
    principal: Principal,
    action: string,
    resource: Resource | string,
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
  authorizedQuery(principal: Principal, action: string, resourceCls: Constructor<Resource>): Promise<AuthorizedFilter>;

  /**
   * Determine the resources of type `resourceCls` that `principal`
   * is allowed to perform `action` on.
   *
   * @param principal Subject.
   * @param action Verb.
   * @param resourceCls Object type.
   * @param filter Additional filter to apply to the query.
   * @param options Query options.
   * @returns An array of authorized resources.
   */
  authorizedResources<T extends Resource>(
    principal: Principal,
    action: string,
    resourceCls: Constructor<T>,
    filter?: FilterExcludingWhere<T>,
    options?: Options,
  ): Promise<T[]>;
}
