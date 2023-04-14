import {Application, Binding} from '@loopback/core';
import {Entity, EntityCrudRepository, RepositoryTags} from '@loopback/repository';
import debugFactory from 'debug';

import {EntityClass} from '../types';
import {RepositoryFactory} from './repository-factory';

const debug = debugFactory('bleco:repository-factory:default-repository-factory');

export class DefaultRepositoryFactory implements RepositoryFactory {
  constructor(protected app: Application) {}

  private _repositories: Map<string, EntityCrudRepository<Entity, unknown>> = new Map();

  get repositories() {
    return this._repositories;
  }

  async discover() {
    debug('Discovering repositories');
    let count = 0;
    const bindings: Readonly<Binding<unknown>>[] = this.app.findByTag(RepositoryTags.REPOSITORY);
    for (const binding of bindings) {
      const repo = await this.app.get<EntityCrudRepository<Entity, unknown>>(binding.key);
      const modelName = repo.entityClass.name;
      const old = this.repositories.get(modelName);
      if (old) {
        debug(
          `Cache repository: ${modelName} => ${repo.constructor.name}(key=${binding.key}) overriding ${old.constructor.name}`,
        );
      }
      debug(`Cache repository: ${modelName} -> ${repo.constructor.name}(key=${binding.key})`);
      this.repositories.set(modelName, repo);
      if (!old) count++;
    }
    debug(`Discovered ${count} repositories`);
  }

  async getRepository<T extends Entity, R extends object = {}>(
    entityClass: string | EntityClass<T>,
  ): Promise<EntityCrudRepository<T, unknown, R>> {
    const modelName = typeof entityClass === 'string' ? entityClass : entityClass.name;
    const repo = this.repositories.get(modelName) as unknown as EntityCrudRepository<T, unknown, R>;
    if (!repo) {
      throw new Error(`No repository found for model ${modelName}`);
    }
    return repo;
  }
}
