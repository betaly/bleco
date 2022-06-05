import {InvocationContext} from '@loopback/context';
import {Entity} from '@loopback/repository';

/**
 * A service for construct a principal object from the given invocation context for acl enforcer.
 */
export interface PrincipalService<T extends Entity = Entity> {
  /**
   * Get the principal object from the given invocation context
   * @example
   * A pseudocode for basic principle retrieval:
   * ```ts
   * class MyPrincipalService implements PrincipalService {
   *   constructor(
   *     @repository(UserRepository) private userRepository: UserRepository,
   *   ) {}
   *
   *   getPrincipal(invocationCtx: InvocationContext): Promise<User> {
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
  getPrincipal(invocationCtx: InvocationContext): Promise<T | undefined>;
}
