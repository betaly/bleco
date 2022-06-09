import {RepositoryFactory} from '@bleco/repository-factory';
import {BindingScope, injectable} from '@loopback/context';
import {AnyObject, Entity, EntityCrudRepository, FilterExcludingWhere, Options, Where} from '@loopback/repository';
import debugFactory from 'debug';
import {get} from 'lodash';
import {toArray} from 'tily/array/toArray';
import isEmpty from 'tily/is/empty';
import {Constructor} from 'tily/typings/types';
import {inspect} from 'util';
import {AuthorizedFilter, Enforcer} from '../../enforcer';
import {ForbiddenError, NotFoundError} from '../../errors';
import {toPrincipalPolymorphic, toResourcePolymorphic} from '../../helpers';
import {AclRoleMapping, AclRoleMappingRelations, AclRolePermission} from '../../models';
import {AclModelRelationKeys, PolicyRegistry, ResolvedPolicy, resolveModelName} from '../../policies';
import {buildRelationRolesIncludes, LocalRoleKey, PolicyBuilder} from './policies';
import ResourceRoles = AclModelRelationKeys.ResourceRoles;
import ResourceRoleMappings = AclModelRelationKeys.ResourceRoleMappings;

const debug = debugFactory('bleco:acl:default-enforcer');

export const DEFAULT_READ_ACTION = 'read';

export interface DefaultEnforcerOptions {
  readAction?: string;
}

@injectable({scope: BindingScope.SINGLETON})
export class DefaultEnhancer implements Enforcer {
  name = 'default';

  protected policyBuilder: PolicyBuilder;

  private readonly readAction: string;

  constructor(
    policyRegistry: PolicyRegistry,
    private repositoryFactory: RepositoryFactory,
    options: DefaultEnforcerOptions = {},
  ) {
    this.policyBuilder = new PolicyBuilder(policyRegistry.policies);
    this.readAction = options.readAction ?? DEFAULT_READ_ACTION;
  }

  async isAllowed(principal: Entity, action: string, resource: Entity): Promise<boolean> {
    const {_, ...roles} = this.policyBuilder.get(resource).actionRoles[action];

    let where: Where;
    let repo: EntityCrudRepository<Entity, unknown>;
    if (isEmpty(roles)) {
      repo = await this.repositoryFactory.getRepository(AclRoleMapping.name);
      where = buildAllowedWhereForRoleMappings(principal, resource, action, _);
    } else {
      repo = await this.repositoryFactory.getRepository(resource.constructor.name);
      where = buildAllowedWhereForResource(principal, this.policyBuilder.get(resource), action);
    }

    debug(`isAllowed check in ${repo.entityClass.name}: %O`, where);
    const [found] = await repo.find({where, limit: 1});
    return !!found;
  }

  async authorize(principal: Entity, action: string, resource: Entity, options?: {checkRead?: boolean}): Promise<void> {
    if (await this.isAllowed(principal, action, resource)) {
      return;
    }

    let isNotFound = false;
    if (options?.checkRead) {
      if (action === this.readAction) {
        isNotFound = true;
      } else {
        const canRead = await this.isAllowed(principal, this.readAction, resource);
        if (!canRead) {
          isNotFound = true;
        }
      }
    }
    const E = isNotFound ? NotFoundError : ForbiddenError;
    throw new E();
  }

  async authorizedActions(
    principal: Entity,
    resource: Entity,
    options?: {allowWildcard?: boolean},
  ): Promise<Set<string | '*'>> {
    const resourceCls = resource.constructor as typeof Entity;
    const resourceRepo = await this.repositoryFactory.getRepository(resourceCls.name);
    const roleMappingRepo = await this.repositoryFactory.getRepository<AclRoleMapping, AclRoleMappingRelations>(
      AclRoleMapping.name,
    );

    const policy = this.policyBuilder.get(resource);

    const inclusion = buildRelationRolesIncludes(resource, policy.roles);
    debug(`authorizedActions - resolve resource relations with:`, inspect(inclusion, {depth: null, colors: true}));

    // resolve resource relations
    const resourceWithRelations = await resourceRepo.findById(resource.getId(), {
      include: inclusion,
    });

    const {_, ...relRoles} = policy.roles;
    const or: AnyObject = [{'role.id': {neq: null}}];
    if (_) {
      // `or` custom role conditions
      or.push({
        ...toResourcePolymorphic(resource),
        roleId: {inq: _},
      });
    }
    if (relRoles) {
      // `or` relation roles conditions
      for (const rel of Object.keys(relRoles)) {
        const relResource = get(resourceWithRelations, rel);
        if (relResource) {
          or.push({
            ...toResourcePolymorphic(relResource),
            roleId: {inq: relRoles[rel]},
          });
        }
      }
    }
    const where: Where = {
      ...toPrincipalPolymorphic(principal),
      or,
    };
    debug(`authorizedActions find role mappings in condition:`, inspect(where, {depth: null, colors: true}));

    const mappings = await roleMappingRepo.find({
      where,
      // include .role.permissions
      include: [
        {
          relation: 'role',
          scope: {
            include: ['permissions'],
          },
        },
      ],
    });
    debug('authorizedActions found role mappings: %O', mappings);

    const actions = new Set<string | '*'>();

    // resolve actions from builtin roles
    for (const key in policy.roleActions) {
      let [rel, role] = key.split(':');
      if (!role) {
        role = rel;
        rel = LocalRoleKey;
      }
      const r = rel === LocalRoleKey ? resource : get(resourceWithRelations, rel);
      const roleMapping = mappings.find(
        m => m.roleId === role && m.resourceId === r?.getId() && m.resourceType === resolveModelName(r?.constructor),
      );
      if (roleMapping) {
        policy.roleActions[key].forEach(a => actions.add(a));
      }
    }

    // resolve actions from custom roles
    for (const mapping of mappings) {
      const role = mapping.role;
      if (role?.permissions) {
        for (const action of role.permissions.map((p: AclRolePermission) => p.action)) {
          actions.add(action);
        }
      }
    }

    return actions;
  }

  async authorizedQuery(
    principal: Entity,
    action: string,
    resourceCls: Constructor<Entity>,
  ): Promise<AuthorizedFilter> {
    const where = buildAllowedWhereForResource(principal, this.policyBuilder.get(resourceCls), action);
    return {model: resourceCls.name, where};
  }

  async authorizedResources<T extends Entity>(
    principal: Entity,
    action: string,
    resourceCls: Constructor<T>,
    filter?: FilterExcludingWhere<T>,
    options?: Options,
  ): Promise<T[]> {
    const repo = await this.repositoryFactory.getRepository<T>(resourceCls.name);
    const where = buildAllowedWhereForResource(principal, this.policyBuilder.get(resourceCls), action);
    return repo.find({where, ...filter}, options);
  }

  authorizeField(principal: Entity, action: string, resource: Entity, field: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  authorizedFields(
    principal: Entity,
    action: string,
    resource: Entity,
    options?: {allowWildcard?: boolean},
  ): Promise<Set<string | '*'>> {
    throw new Error('Method not implemented.');
  }
}

function buildAllowedWhereForRoleMappings(
  principal: Entity,
  resource: Entity,
  action: string | string[],
  roles: string[],
) {
  const actions = toArray(action);
  const actionValue = actions.length === 1 ? actions[0] : {inq: actions};
  const or: AnyObject[] = [{'role.permissions.action': actionValue}];
  if (!isEmpty(roles)) {
    or.push({roleId: {inq: roles}});
  }
  return {
    ...toPrincipalPolymorphic(principal),
    ...toResourcePolymorphic(resource),
    or,
  } as Where;
}

function buildAllowedWhereForResource(principal: Entity, resourcePolicy: ResolvedPolicy, action: string) {
  const {principalType, principalId} = toPrincipalPolymorphic(principal);
  const {_, ...roles} = resourcePolicy.actionRoles[action];
  const or: AnyObject[] = [
    {
      [`${ResourceRoles}.principals.principalType`]: principalType,
      [`${ResourceRoles}.principals.principalId`]: principalId,
      [`${ResourceRoles}.permissions.action`]: action,
    },
  ];
  if (!isEmpty(_)) {
    or.push({
      [`${ResourceRoleMappings}.principalType`]: principalType,
      [`${ResourceRoleMappings}.principalId`]: principalId,
      [`${ResourceRoleMappings}.roleId`]: {inq: _},
    });
  }
  if (!isEmpty(roles)) {
    for (const rel of Object.keys(roles)) {
      or.push({
        [`${rel}.${ResourceRoleMappings}.principalType`]: principalType,
        [`${rel}.${ResourceRoleMappings}.principalId`]: principalId,
        [`${rel}.${ResourceRoleMappings}.roleId`]: {inq: roles[rel]},
      });
    }
  }
  return {or} as Where;
}
