/* eslint-disable @typescript-eslint/no-explicit-any */
import {Knex} from "knex";
import {
  Entity,
  EntityCrudRepository,
  includeRelatedModels,
  InclusionFilter,
  juggler,
  Options
} from "@loopback/repository";
import {Filter} from "@loopback/filter";
import {EntityClass, IdSort} from "./types";
import {DefaultMapper, Mapper} from "./mapper";
import {createKnex} from "./knex";
import {assert} from "tily/assert";

const debug = require("debug")("bleco:query");

export abstract class Query<T extends Entity, ID = unknown, Relations extends object = {}> {
  public readonly entityClass: EntityClass<T>;
  public readonly dataSource: juggler.DataSource;
  protected knex: Knex
  protected mapper: Mapper;
  protected repo?: EntityCrudRepository<T, ID, Relations>;

  constructor(repo: EntityCrudRepository<T, ID, Relations>, dataSource?: juggler.DataSource)
  constructor(entityClass: EntityClass<T>, dataSource: juggler.DataSource)
  constructor(
    entityClassOrRepo: EntityClass<T> | EntityCrudRepository<T, ID, Relations>,
    ds?: juggler.DataSource
  ) {
    if (typeof entityClassOrRepo === 'function') {
      this.entityClass = entityClassOrRepo;
      this.dataSource = ds!;
    } else {
      this.repo = entityClassOrRepo;
      this.entityClass = entityClassOrRepo.entityClass;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.dataSource = ds ?? (entityClassOrRepo as any).dataSource;
    }
    this.knex = createKnex(this.dataSource);
    this.mapper = new DefaultMapper(this.dataSource);
    this.init();
  }


  applySortPolicy(filter: Filter<T>) {
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

  getDefaultIdSortPolicy(): IdSort {
    const definition = this.entityClass.definition;
    if (Object.hasOwn(definition.settings, 'defaultIdSort')) {
      return definition.settings.defaultIdSort;
    }

    return true;
  }

  hasOnlyNumericIds() {
    const cols = this.entityClass.definition.properties;
    const idNames = this.mapper.idNames(this.entityClass.modelName);
    const numericIds = idNames.filter(idName => cols[idName].type === Number);
    return numericIds.length === idNames.length;
  };

  protected abstract init(): void;


  protected toEntity<R extends T>(model: Record<string, any>): R {
    return new this.entityClass(model) as R;
  }

  protected toEntities<R extends T>(models: Record<string, any>[]): R[] {
    return models.map(m => this.toEntity<R>(m));
  }

  /**
   * Returns model instances that include related models of this repository
   * that have a registered resolver.
   *
   * @param entities - An array of entity instances or data
   * @param include -Inclusion filter
   * @param options - Options for the operations
   */
  protected async includeRelatedModels(
    entities: T[],
    include?: InclusionFilter[],
    options?: Options,
  ): Promise<(T & Relations)[]> {
    assert(this.repo, 'Query is missing repository to includeRelatedModels')
    return includeRelatedModels<T, Relations>(this.repo, entities, include, options);
  }

}
