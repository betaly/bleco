import {BootMixin} from '@bleco/boot';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ApplicationConfig} from '@loopback/core';
import {GitClubComponent} from './components/gitclub';
import {AclMixin} from '../../mixins';
import {AclAuthDBName, AclResourceDBName} from '../../types';

export class GitClubApplication extends BootMixin(AclMixin(RepositoryMixin(RestApplication))) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;

    this.bind(`datasources.${AclAuthDBName}`).toAlias(`datasources.db`);
    this.bind(`datasources.${AclResourceDBName}`).toAlias(`datasources.db`);

    this.component(GitClubComponent);
  }
}
