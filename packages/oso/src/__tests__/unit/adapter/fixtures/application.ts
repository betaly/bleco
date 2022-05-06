import {BootMixin} from '@bleco/boot';
import {ApplicationConfig, Binding} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {Entity, EntityCrudRepository, RepositoryMixin, RepositoryTags} from '@loopback/repository';
import {OsoComponent} from '../../../../oso.component';
import {OsoBindings} from '../../../../keys';
import {Constructor} from 'tily/typings/types';

export class OsoApp extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;

    this.component(OsoComponent);

    this.onStart(async () => {
      const oso = await this.get(OsoBindings.AUTHORIZER);
      const repoBindings: Readonly<Binding<unknown>>[] = this.findByTag(RepositoryTags.REPOSITORY);
      for (const binding of repoBindings) {
        const repo = (await this.get(binding.key)) as EntityCrudRepository<Entity, unknown>;
        oso.registerClassWithModelAndRepository(
          repo.entityClass,
          binding.valueConstructor! as Constructor<EntityCrudRepository<Entity, unknown>>,
        );
      }
    });
  }
}
