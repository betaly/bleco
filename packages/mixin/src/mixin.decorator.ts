import {Mixer, MixinTarget} from './types';

/**
 * The Problem:
 *
 * Assumes that we have a class Mixin that extends the default repository to provide
 * audit functions.
 *
 * export function AuditRepositoryMixin<
 *   M extends Entity,
 *   ID,
 *   Relations extends object,
 *   R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
 * >(superClass: R) {
 *   return class extends superClass {
 *     // ...
 *   };
 * }
 *
 * When we want to provide another generic Class that applies the AuditRepositoryMixin:
 *
 * export class SoftDeleteRepository<
 *   M extends Entity,
 *   ID,
 *   Relations extends object,
 *   R extends MixinTarget<EntityCrudRepository<M, ID, Relations>>,
 * > extends AuditRepositoryMixin<M, ID, Relations, R>(DefaultCrudRepository) {}
 *                                ~~~~~~~~~~~~~~~~~~~
 *  TS2562: Base class expressions cannot reference class type parameters.
 *
 * Here has a similar issue, but the solution can not be applied to the above situation.
 * https://github.com/microsoft/TypeScript/issues/26542
 *
 * The Solution:
 *
 * interface AuditRepository {
 *   // extract AuditRepositoryMixin extension's fields and methods
 * }
 *
 * @mixin(AuditRepositoryMixin)
 * export class SoftDeleteRepository<
 *   M extends Entity,
 *   ID,
 *   Relations extends object,
 * > extends DefaultCrudRepository<M, ID, Relations> {}
 *
 * export interface SoftDeleteRepository<
 *   M extends Entity,
 *   ID,
 *   Relations extends object,
 * > extends AuditRepository<M, ID, Relations>> {}
 *
 */
export function mixin<T extends object, M extends MixinTarget<T>>(mixer: Mixer<T, M>) {
  return (superClass: M) => mixer(superClass);
}
