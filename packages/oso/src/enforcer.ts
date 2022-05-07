import debugFactory from 'debug';
import {Oso} from 'oso';
import {Entity, EntityCrudRepository, juggler} from '@loopback/repository';
import {ClassParams, Options} from 'oso/dist/src/types';
import {inject} from '@loopback/context';
import {OsoBindings} from './keys';
import {Application, CoreBindings} from '@loopback/core';
import {OsoJugglerAdapter} from './juggler-adapter';
import {OsoDataSourceName, ResourceFilter} from './types';
import {Constructor} from 'tily/typings/types';
import {resolveClassFields} from './helper';

const debug = debugFactory('bleco:oso:enforcer');

export interface EnforcerClassOptions extends Omit<ClassParams, 'fields'> {}

export interface EnforcerOptions extends Options {}

export class Enforcer<
  Actor = unknown,
  Action = unknown,
  Resource extends Entity = Entity,
  Field = unknown,
  Request = unknown,
> extends Oso<Actor, Action, Resource, Field, Request, ResourceFilter<Resource>> {
  private repos: Map<string, string> = new Map();

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

  registerClassWithModelAndRepository(
    model: typeof Entity,
    repo: string | Constructor<EntityCrudRepository<Entity, unknown>>,
    options?: EnforcerClassOptions,
  ): void {
    const repoName = typeof repo === 'string' ? repo : repo.name;
    if (this.repos.has(model.name)) {
      debug(`Model ${model.name} already registered. Skip.`);
      return;
    }
    this.repos.set(model.modelName, repoName);
    const fields = resolveClassFields(model);
    debug('Register model "%s" with fields: %o', model.modelName, fields);
    this.registerClass(model, {fields, ...options});
  }

  async getRepository<T extends Entity = Entity>(model: string): Promise<EntityCrudRepository<T, unknown>> {
    const repoName = this.repos.get(model);
    return (await this.app.get(`repositories.${repoName}`)) as EntityCrudRepository<T, unknown>;
  }
}
