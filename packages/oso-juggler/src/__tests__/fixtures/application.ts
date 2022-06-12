import {BootMixin} from '@bleco/boot';
import {DefaultRepositoryFactoryProvider, RepoBindings} from '@bleco/repo';
import {Application, ApplicationConfig, BindingScope} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';

export class OsoApp extends BootMixin(RepositoryMixin(Application)) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;

    this.bind(RepoBindings.REPOSITORY_FACTORY)
      .toProvider(DefaultRepositoryFactoryProvider)
      .inScope(BindingScope.SINGLETON);
  }
}
