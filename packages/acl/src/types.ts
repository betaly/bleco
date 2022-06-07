import {InvocationContext} from '@loopback/context';
import {AnyObject, Entity, Filter, KeyOf} from '@loopback/repository';
import {OmitProperties} from 'ts-essentials';

export const AclAuthDBName = 'AclAuthDB';
export const AclResourceDBName = 'AclResourceDB';

export const GlobalDomain = '$global';

export type QueryWhereExcludingWhere<T extends object = AnyObject> = Omit<Filter<T>, 'where'>;

export type DeleteResult<D extends Record<string, number> = Record<string, number>> = {
  count: number;
  details?: D;
};

export type EntityLike = Entity | {id: string | number};
export type DomainLike = EntityLike;

export type ObjectProps<MT extends object, MP extends object = OmitProperties<MT, Function>> = {
  [P in KeyOf<MP>]?: MP[P];
};

export interface DomainAware {
  domain: string;
}

export interface PrincipalAware {
  principalType?: string;
  principalId?: string;
}

export interface RoleAware {
  roleId?: string;
}

export interface ResourceAware {
  resourceId?: string;
  resourceType?: string;
}

export type PrincipalPolymorphic = Required<PrincipalAware>;

export type PrincipalPolymorphicOrEntity = Entity | PrincipalPolymorphic;

export type ResourcePolymorphic = Required<ResourceAware>;

export type ResourcePolymorphicOrEntity = Entity | ResourcePolymorphic;

/**
 * Get the principal object from the given invocation context
 * @example
 * A pseudocode for basic principle retrieval:
 * ```ts
 * class MyPrincipalResolverProvider implements Provider<PrincipalResolver> {
 *   constructor(
 *     @repository(UserRepository) private userRepository: UserRepository,
 *   ) {}
 *
 *   value(): PrincipalResolver {
 *     return this.resolve.bind(this);
 *   }
 *
 *   resolve(invocationCtx: InvocationContext): Promise<User> {
 *     const user = await invocationCtx.get<UserProfile>(SecurityBindings.USER);
 *     if (user instanceof User) {
 *       return user;
 *     }
 *     return this.userRepository.findById(user.id);
 *     // or
 *     // return new User(user);
 *   }
 * }
 *
 * ```
 *
 * @param invocationCtx - The invocation context
 */
export type PrincipalResolver<T extends Entity = Entity> = (invocationCtx: InvocationContext) => Promise<T | undefined>;
