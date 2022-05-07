import debugFactory from 'debug';
import {Oso} from 'oso';
import {Constructor} from 'tily/typings/types';
import isString from 'tily/is/string';
import {isConstructor} from 'tily/is/constructor';
import {ClassParams, Options} from 'oso/dist/src/types';
import {inject} from '@loopback/context';
import {Application, CoreBindings} from '@loopback/core';
import {Entity, EntityCrudRepository, juggler} from '@loopback/repository';
import {DefaultCrudRepositoryWithQuery, EntityClass} from '@bleco/query';
import {OsoDataSourceName, ResourceFilter} from './types';
import {OsoBindings} from './keys';
import {OsoJugglerAdapter} from './juggler-adapter';
import {buildClassFields} from './helper';

const debug = debugFactory('bleco:oso:enforcer');

export interface EnforcerClassOptions extends Omit<ClassParams, 'fields'> {}

export interface EnforcerOptions extends Options {}

interface ModelRepo<T extends Entity = Entity> {
  model: EntityClass<T>;
  repo?: string | EntityCrudRepository<T, unknown>;
  options?: EnforcerClassOptions;
}

export class Enforcer<
  Actor = unknown,
  Action = unknown,
  Resource extends Entity = Entity,
  Field = unknown,
  Request = unknown,
> extends Oso<Actor, Action, Resource, Field, Request, ResourceFilter<Resource>> {
  readonly models: Map<string, ModelRepo> = new Map();

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    readonly app: Application,
    @inject(`datasources.${OsoDataSourceName}`, {optional: true})
    readonly dataSource?: juggler.DataSource,
    @inject(OsoBindings.CONFIG, {optional: true})
    options?: EnforcerOptions,
  ) {
    super(options);
    this.setDataFilteringAdapter(new OsoJugglerAdapter(app));
  }

  addModel(model: EntityClass, options?: EnforcerClassOptions): void;
  addModel(
    model: EntityClass,
    repo: string | Constructor<EntityCrudRepository<Entity, unknown>>,
    options?: EnforcerClassOptions,
  ): void;
  addModel(
    model: EntityClass,
    repo?: string | Constructor<EntityCrudRepository<Entity, unknown>> | EnforcerClassOptions,
    options?: EnforcerClassOptions,
  ): void {
    if (!isString(repo) && !isConstructor(repo)) {
      options = repo as EnforcerClassOptions;
      repo = undefined;
    }
    const repoName = typeof repo === 'string' ? repo : repo?.name;
    if (this.models.has(model.modelName)) {
      debug(`Model ${model.name} already registered. Skip.`);
      return;
    }
    this.models.set(model.modelName, {model, repo: repoName, options});
    const fields = buildClassFields(model);
    debug('Register model "%s" with fields: %o', model.modelName, fields);
    this.registerClass(model, {fields, ...options});
  }

  async getRepository<T extends Entity = Entity>(model: string): Promise<EntityCrudRepository<T, unknown>> {
    const item = this.models.get(model) as unknown as ModelRepo<T>;
    if (!item) {
      throw new Error(`Model "${model}" not registered.`);
    }
    if (item.repo) {
      if (isString(item.repo)) {
        return (await this.app.get(`repositories.${item.repo}`)) as EntityCrudRepository<T, unknown>;
      }
      return item.repo as unknown as EntityCrudRepository<T, unknown>;
    }

    if (!this.dataSource) {
      throw new Error(
        `Can not get repository for model "${model}". No repository defined and no data source available.`,
      );
    }
    return (item.repo = new DefaultCrudRepositoryWithQuery<T, unknown>(item.model as EntityClass<T>, this.dataSource));
  }
}
