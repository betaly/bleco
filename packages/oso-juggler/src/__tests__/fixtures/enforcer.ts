import {EntityClass} from '@bleco/query';
import {RepositoryFactory} from '@bleco/repo';
import {Context} from '@loopback/context';
import {Binding} from '@loopback/core';
import {Entity, EntityCrudRepository, RepositoryTags} from '@loopback/repository';
import debugFactory from 'debug';
import {Oso} from 'oso';

import {OsoJugglerHelper} from '../../helper';
import {JugglerAdapter} from '../../juggler-adapter';
import {AuthorizedFilter} from '../../types';

const debug = debugFactory('bleco:enforcer-adapter-juggler:enforcer');

export class Enforcer<
  Actor = unknown,
  Action = unknown,
  Resource extends Entity = Entity,
  Field = unknown,
  Request = unknown,
> extends Oso<Actor, Action, Resource, Field, Request, AuthorizedFilter<Resource>> {
  constructor(public repositoryFactory: RepositoryFactory) {
    super();
    this.setDataFilteringAdapter(new JugglerAdapter(repositoryFactory));
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
