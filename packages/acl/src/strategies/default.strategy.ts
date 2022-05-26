// import {Class} from 'tily/typings/types';
// import {BelongsToAccessor, BelongsToDefinition, createBelongsToAccessor, Entity} from '@loopback/repository';
// import {BindingScope, inject, injectable} from '@loopback/context';
// import {RepositoryFactory, RepositoryFactoryBindings} from "@bleco/repository-factory";
// import {AuthorizedFilter, EnforcerStrategy} from '../enforcer';
// import {AclBindings} from '../keys';
// import {PolicyManager, PolicyResolver} from '../policies';
// import {toPrincipalPolymorphic, toResourcePolymorphic} from '../helpers';
// import {RoleMappingService} from '../services';
// import {resolveBelongsToMetadata} from "@loopback/repository/dist/relations/belongs-to/belongs-to.helpers";
//
// @injectable({scope: BindingScope.SINGLETON})
// export class DefaultEnhancerStrategy implements EnforcerStrategy {
//   name = 'default';
//
//   protected resolver: PolicyResolver;
//   protected belongsToAccessors: Map<string, BelongsToAccessor<Entity, unknown>>;
//
//   constructor(
//     @inject(AclBindings.POLICY_MANAGER)
//     private policyManager: PolicyManager,
//     @inject(AclBindings.ROLE_MAPPING_SERVICE)
//     private roleMappingService: RoleMappingService,
//     @inject(RepositoryFactoryBindings.REPOSITORY_FACTORY)
//     private repositoryFactory: RepositoryFactory,
//   ) {
//     this.resolver = new PolicyResolver(this.policyManager);
//   }
//
//   async isAllowed(principal: Entity, action: string, resource: Entity): Promise<boolean> {
//     const {resourceType} = toResourcePolymorphic(resource);
//     const policy = this.resolver.policies.get(resourceType);
//     if (!policy) {
//       throw new Error(`No policy found for resource type "${resourceType}"`);
//     }
//     const roles = policy.permissionRoles[action];
//
//     if (await this.hasRoles(principal, resource, roles.locals)) {
//       return true;
//     }
//     if (await this.roleMappingService.findOne({
//       where: {
//         ...toPrincipalPolymorphic(principal),
//         ...toResourcePolymorphic(resource),
//         'role.permissions.permission': action,
//       },
//     })) {
//       return true;
//     }
//     for (const rel in roles.relations) {
//       const parent = await this.findParentEntity(resource, rel);
//       if (await this.hasRoles(principal, parent, roles.relations[rel])) {
//         return true;
//       }
//     }
//     return false;
//   }
//
//   authorize(principal: Entity, action: string, resource: Entity, options?: {checkRead?: boolean}): Promise<void> {
//     throw new Error('Method not implemented.');
//   }
//
//   authorizedActions(
//     principal: Entity,
//     resource: Entity,
//     options?: {allowWildcard?: boolean},
//   ): Promise<Set<string | '*'>> {
//     throw new Error('Method not implemented.');
//   }
//
//   authorizedQuery(principal: Entity, action: string, resourceCls: Class<Entity>): Promise<AuthorizedFilter> {
//     throw new Error('Method not implemented.');
//   }
//
//   authorizedResources(principal: Entity, action: string, resourceCls: Class<Entity>): Promise<Entity[]> {
//     throw new Error('Method not implemented.');
//   }
//
//   authorizeField(principal: Entity, action: string, resource: Entity, field: string): Promise<void> {
//     throw new Error('Method not implemented.');
//   }
//
//   authorizedFields(
//     principal: Entity,
//     action: string,
//     resource: Entity,
//     options?: {allowWildcard?: boolean},
//   ): Promise<Set<string | '*'>> {
//     throw new Error('Method not implemented.');
//   }
//
//   protected async hasRoles(principal: Entity, resource: Entity, roles: string[]): Promise<boolean> {
//     const found = await this.roleMappingService.findOne({
//       where: {
//         roleId: {inq: roles},
//         ...toPrincipalPolymorphic(principal),
//         ...toResourcePolymorphic(resource),
//       },
//     });
//     return !!found;
//   }
//
//   protected async getAccessor(resource: Entity, relation: string): Promise<BelongsToAccessor<Entity, unknown>> {
//     const modelName = resource.constructor.name;
//     if (!this.belongsToAccessors) {
//       this.belongsToAccessors = new Map();
//     }
//     let accessor = this.belongsToAccessors.get(modelName);
//     if (!accessor) {
//       const definition = (resource.constructor as typeof Entity).definition;
//       const repository = await this.repositoryFactory.getRepository(definition.name);
//       const belongsToDefinition = definition.relations[relation];
//       if (!belongsToDefinition) {
//         throw new Error(`Relation "${relation}" not found on model "${modelName}"`);
//       }
//       if (belongsToDefinition.type !== 'belongsTo') {
//         throw new Error(`Relation "${relation}" on model "${modelName}" is not a belongsTo relation`);
//       }
//       const metadata = resolveBelongsToMetadata(belongsToDefinition as BelongsToDefinition);
//       accessor = createBelongsToAccessor(metadata, () => this.repositoryFactory.getRepository(metadata.target()), repository);
//       this.belongsToAccessors.set(modelName, accessor);
//     }
//     return accessor;
//   }
//
//   protected async findParentEntity(entity: Entity, relation: string): Promise<Entity> {
//     const accessor = await this.getAccessor(entity, relation);
//     return await accessor(entity.getId());
//   }
// }
