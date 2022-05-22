import {BootMixin} from '@bleco/boot';
import {RestApplication} from '@loopback/rest';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {AclMixin} from '../../mixins';
import {AclAuthDBName} from '../../types';

export class AclApp extends BootMixin(AclMixin(RepositoryMixin(RestApplication))) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;

    this.bind(`datasources.${AclAuthDBName}`).toAlias(`datasources.db`);
  }
}