import {Entity, EntityCrudRepository, RepositoryTags} from '@loopback/repository';
import {Oso} from 'oso';
import {RepositoryFactory, ResourceFilter} from '../../../types';
import {JugglerAdapter} from '../../../juggler-adapter';
import {Context} from '@loopback/context';
import {Binding} from '@loopback/core';
import {EntityClass} from '@bleco/query';
import debugFactory from 'debug';
import {OsoJugglerHelper} from '../../../helper';

const debug = debugFactory('bleco:enforcer-adapter-juggler:enforcer');

export class Enforcer<
  Actor = unknown,
  Action = unknown,
  Resource extends Entity = Entity,
  Field = unknown,
  Request = unknown,
> extends Oso<Actor, Action, Resource, Field, Request, ResourceFilter<Resource>> {
  constructor(public getRepository: RepositoryFactory<Resource>) {
    super();
    this.setDataFilteringAdapter(new JugglerAdapter(getRepository));
  }

  async registerModelsFromApplication(context: Context) {
    const repoBindings: Readonly<Binding<unknown>>[] = context.findByTag(RepositoryTags.REPOSITORY);
    for (const binding of repoBindings) {
      const repo = (await context.get(binding.key)) as EntityCrudRepository<Entity, unknown>;
      this.registerModel(repo.entityClass);
    }
  }

  protected registerModel(entity: EntityClass) {
    const fields = OsoJugglerHelper.buildClassFields(entity);
    debug('Register model "%s" with fields: %o', entity.modelName, fields);
    this.registerClass(entity, {fields});
  }
}
