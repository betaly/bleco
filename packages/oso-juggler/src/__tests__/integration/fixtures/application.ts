import {BootMixin} from '@bleco/boot';
import {Application, ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';

export class OsoApp extends BootMixin(RepositoryMixin(Application)) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;
  }
}
