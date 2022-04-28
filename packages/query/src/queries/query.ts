/* eslint-disable @typescript-eslint/no-explicit-any */
import {Knex} from 'knex';
import {Entity, EntityCrudRepository, juggler, Options} from '@loopback/repository';
import {Filter} from '@loopback/filter';
import {EntityClass, IdSort} from '../types';
import {DefaultMapper, Mapper} from '../mapper';
import {createKnex} from '../knex';
import {QueryFilter, QueryWhere} from '../filter';

const debug = require('debug')('bleco:query');

export interface Query<T extends Entity, Relations extends object = {}> {
  find(filter?: QueryFilter<T>, options?: Options): Promise<(T & Relations)[]>;

  findOne(filter?: QueryFilter<T>, options?: Options): Promise<(T & Relations) | null>;

  count(where?: QueryWhere<T>, options?: Options): Promise<{count: number}>;
}

export abstract class AbstractQuery<T extends Entity, Relations extends object = {}> implements Query<T, Relations> {
  public readonly entityClass: EntityClass<T>;
  public readonly dataSource: juggler.DataSource;
  protected knex: Knex;
  protected mapper: Mapper;
  protected repo?: EntityCrudRepository<T, unknown, Relations>;

  constructor(repo: EntityCrudRepository<T, unknown, Relations>, dataSource?: juggler.DataSource);
  constructor(entityClass: EntityClass<T>, dataSource: juggler.DataSource);
  constructor(
    entityClassOrRepo: EntityClass<T> | EntityCrudRepository<T, unknown, Relations>,
    ds?: juggler.DataSource,
  ) {
    if (typeof entityClassOrRepo === 'function') {
      this.entityClass = entityClassOrRepo;
      this.dataSource = ds!;
    } else {
      this.repo = entityClassOrRepo;
      this.entityClass = entityClassOrRepo.entityClass;
      this.dataSource = ds ?? (entityClassOrRepo as any).dataSource;
    }
    this.knex = createKnex(this.dataSource);
    this.mapper = new DefaultMapper(this.dataSource);
    this.init();
  }

  abstract count(where?: QueryWhere<T>, options?: Options): Promise<{count: number}>;

  abstract find(filter?: QueryFilter<T>, options?: Options): Promise<(T & Relations)[]>;

  abstract findOne(filter?: QueryFilter<T>, options?: Options): Promise<(T & Relations) | null>;

  protected applySortPolicy(filter: Filter<T>) {
    const sortPolicy = this.getDefaultIdSortPolicy();
    const sortById = (() => {
      switch (sortPolicy) {
        case 'numericIdOnly':
          return this.hasOnlyNumericIds();
        case false:
          return false;
        default:
          return true;
      }
    })();

    debug(this.entityClass.modelName, 'sort policy:', sortPolicy, sortById);

    if (sortById && !filter.order) {
      const idNames = this.mapper.idNames(this.entityClass.modelName);
      if (idNames?.length) {
        filter.order = idNames;
      }
    }
  }

  protected getDefaultIdSortPolicy(): IdSort {
    const definition = this.entityClass.definition;
    if (Object.hasOwn(definition.settings, 'defaultIdSort')) {
      return definition.settings.defaultIdSort;
    }

    return true;
  }

  protected hasOnlyNumericIds() {
    const cols = this.entityClass.definition.properties;
    const idNames = this.mapper.idNames(this.entityClass.modelName);
    const numericIds = idNames.filter(idName => cols[idName].type === Number);
    return numericIds.length === idNames.length;
  }

  protected abstract init(): void;

  protected toEntity<R extends T>(model: Record<string, any>): R {
    return new this.entityClass(model) as R;
  }

  protected toEntities<R extends T>(models: Record<string, any>[]): R[] {
    return models.map(m => this.toEntity<R>(m));
  }
}
