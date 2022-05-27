import {BootMixin} from '@bleco/boot';
import {Application, ApplicationConfig, BindingScope} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {DefaultRepositoryFactoryProvider, RepositoryFactoryBindings} from '@bleco/repository-factory';

export class OsoApp extends BootMixin(RepositoryMixin(Application)) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;

    this.bind(RepositoryFactoryBindings.REPOSITORY_FACTORY)
      .toProvider(DefaultRepositoryFactoryProvider)
      .inScope(BindingScope.SINGLETON);
  }
}