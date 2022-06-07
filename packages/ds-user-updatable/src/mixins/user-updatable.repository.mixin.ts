/* eslint-disable @typescript-eslint/ban-ts-comment */
import {MixinTarget} from '@bleco/mixin';
import {
  AnyObject,
  Count,
  DataObject,
  DefaultCrudRepository,
  Entity,
  FilterExcludingWhere,
  Options,
  Where,
} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {toArray} from 'tily/array/toArray';
import {UserUpdatableModel} from './user-updatable-entity.mixin';

export const InvalidCredentials = 'Invalid Credentials';

export type UserType<ID = string> = {id?: ID; userTenantId?: ID};

export interface UserUpdatableRepositoryMixinOptions<U extends AnyObject> {
  /**
   * Throw InvalidCredentials error if no getCurrentUser function provided or no user signed in.
   */
  throwIfNoUser?: boolean;
  /**
   * The keys of user id in user object. It will try to get user id from user object by keys in order until got a first non-null value.
   */
  userIdKey?: keyof U | (keyof U)[];
}

export function UserUpdatableRepositoryMixin<U extends AnyObject = AnyObject>(
  opts: UserUpdatableRepositoryMixinOptions<U> = {},
) {
  return <
    T extends Entity & UserUpdatableModel,
    ID,
    Relations extends object,
    R extends MixinTarget<DefaultCrudRepository<T, ID, Relations>>,
  >(
    superClass: R,
  ) => {
    const throwIfNoUser = opts.throwIfNoUser ?? true;
    const userIdKeys = toArray(opts.userIdKey ?? 'id');

    const getUserId = userIdGetter(userIdKeys as string[]);

    class MixedRepository extends superClass {
      getCurrentUser?: () => Promise<AnyObject>;

      // @ts-ignore
      async create(entity: DataObject<T>, options?: Options): Promise<T> {
        let currentUser = await this.getCurrentUser?.();
        currentUser = currentUser ?? options?.currentUser;
        if (!currentUser && throwIfNoUser) {
          throw new HttpErrors.Forbidden(InvalidCredentials);
        }
        const uid = getUserId(currentUser);
        entity.createdBy = uid;
        entity.updatedBy = uid;
        return super.create(entity, options);
      }

      // @ts-ignore
      async createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
        let currentUser = await this.getCurrentUser?.();
        currentUser = currentUser ?? options?.currentUser;
        if (!currentUser && throwIfNoUser) {
          throw new HttpErrors.Forbidden(InvalidCredentials);
        }
        const uid = getUserId(currentUser);
        entities.forEach(entity => {
          entity.createdBy = uid ?? '';
          entity.updatedBy = uid ?? '';
        });
        return super.createAll(entities, options);
      }

      // @ts-ignore
      async save(entity: T, options?: Options): Promise<T> {
        const currentUser = await this.getCurrentUser?.();
        if (!currentUser && throwIfNoUser) {
          throw new HttpErrors.Forbidden(InvalidCredentials);
        }
        entity.updatedBy = getUserId(currentUser);
        return super.save(entity, options);
      }

      // @ts-ignore
      async update(entity: T, options?: Options): Promise<void> {
        const currentUser = await this.getCurrentUser?.();
        if (!currentUser && throwIfNoUser) {
          throw new HttpErrors.Forbidden(InvalidCredentials);
        }
        entity.updatedBy = getUserId(currentUser);
        return super.update(entity, options);
      }

      // @ts-ignore
      async updateAll(data: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count> {
        let currentUser = await this.getCurrentUser?.();
        currentUser = currentUser ?? options?.currentUser;
        if (!currentUser && throwIfNoUser) {
          throw new HttpErrors.Forbidden(InvalidCredentials);
        }
        data.updatedBy = getUserId(currentUser);
        return super.updateAll(data, where, options);
      }

      // @ts-ignore
      async updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
        let currentUser = await this.getCurrentUser?.();
        currentUser = currentUser ?? options?.currentUser;
        if (!currentUser && throwIfNoUser) {
          throw new HttpErrors.Forbidden(InvalidCredentials);
        }
        data.updatedBy = getUserId(currentUser);
        return super.updateById(id, data, options);
      }

      // @ts-ignore
      async replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void> {
        const currentUser = await this.getCurrentUser?.();
        if (!currentUser && throwIfNoUser) {
          throw new HttpErrors.Forbidden(InvalidCredentials);
        }
        const model = await this.findById(id, {fields: ['id', 'createdBy']} as FilterExcludingWhere<T>, options);
        data.createdBy = model.createdBy;
        data.updatedBy = getUserId(currentUser);
        return super.replaceById(id, data, options);
      }
    }

    return MixedRepository;
  };
}

function userIdGetter(keys: string[]) {
  return (user?: AnyObject) => {
    if (user) {
      for (const key of keys) {
        if (user[key]) {
          return user[key];
        }
      }
    }
    return null;
  };
}

export interface UserUpdatableRepository<T extends Entity & UserUpdatableModel, ID, Relations extends object, UserID>
  extends DefaultCrudRepository<T, ID, Relations> {
  getCurrentUser?: () => Promise<UserType<UserID>>;
}
