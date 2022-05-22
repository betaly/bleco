import {RepositoryFactory} from 'oso-juggler';
import {Entity, EntityCrudRepository, juggler, RepositoryBindings} from '@loopback/repository';
import {EntityClass, QueryEnhancedCrudRepository} from '@bleco/query';
import {Application, CoreBindings} from '@loopback/core';
import {inject, Provider} from '@loopback/context';
import {AclResourceDBName} from '@bleco/acl';

export class RepositoryFactoryProvider implements Provider<RepositoryFactory> {
  repos = new Map<string, EntityCrudRepository<Entity, unknown>>();

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected app: Application,
    @inject(`datasources.${AclResourceDBName}`)
    protected dataSource?: juggler.DataSource,
  ) {}

  async value(): Promise<RepositoryFactory> {
    return modelName => this.getRepository(modelName);
  }

  async getRepository(modelName: string): Promise<EntityCrudRepository<Entity, unknown>> {
    const repo = this.repos.has(modelName);
    if (!repo) {
      const model = await this.app.get<EntityClass>(`${RepositoryBindings.MODELS}.${modelName}`);

      if (!this.dataSource) {
        throw new Error(
          `Can not get repository for model "${modelName}". No repository defined and no data source available.`,
        );
      }

      this.repos.set(modelName, new QueryEnhancedCrudRepository(model, this.dataSource));
    }
    return this.repos.get(modelName) as EntityCrudRepository<Entity, unknown>;
  }
}
