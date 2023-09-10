import {Getter} from '@loopback/core';
import {Count, DataObject, Entity, Filter, FilterExcludingWhere, Options, Where} from '@loopback/repository';

import {AuditLogRepository} from './repositories';
import {AuditLogRepository as SequelizeAuditLogRepository} from './repositories/sequelize';

export const AuditDbSourceName = 'AuditDB';
export interface IAuditMixin<UserID> {
  getAuditLogRepository: Getter<AuditLogRepository | SequelizeAuditLogRepository>;
  getCurrentUser?: Getter<IUser>;
  actorIdKey?: ActorId;
}

export interface IAuditMixinOptions {
  actionKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; //NOSONAR
}
export interface AuditLogOption {
  noAudit: boolean;
  actorId?: string;
}
export declare type AuditOptions = Options & AuditLogOption;

export type AbstractConstructor<T> = abstract new (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) => T;

export type MixinBaseClass<T> = AbstractConstructor<T>;

export type AuditMixinBase<T extends Entity, ID, Relations> = MixinBaseClass<{
  entityClass: typeof Entity & {
    prototype: T;
  };
  find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]>;
  findById(id: ID, filter?: FilterExcludingWhere<T>, options?: Options): Promise<T & Relations>;
  create(entity: DataObject<T>, options?: Options): Promise<T>;
  createAll(entities: DataObject<T>[], options?: Options): Promise<T[]>;
  update(entity: T, options?: Options): Promise<void>;
  delete(entity: T, options?: Options): Promise<void>;
  updateAll(data: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count>;
  updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;
  replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;
  deleteAll(where?: Where<T>, options?: Options): Promise<Count>;
  deleteById(id: ID, options?: Options): Promise<void>;
  deleteAllHard?(where?: Where<T>, options?: Options): Promise<Count>;
  deleteByIdHard?(id: ID, options?: Options): Promise<void>;
}>;

export interface IUser {
  id?: string;
  [key: string]: unknown;
}

export type ActorId<T extends IUser = IUser> = Extract<keyof T, string>;
