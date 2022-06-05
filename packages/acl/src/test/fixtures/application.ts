import {BootMixin} from '@bleco/boot';
import {AuthorizationComponent} from '@loopback/authorization';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {AclMixin} from '../../mixins';
import {AclAuthDBName, AclResourceDBName} from '../../types';
import {AccountComponent} from './components/account';
import {GitClubComponent} from './components/gitclub';

export class GitClubApplication extends BootMixin(AclMixin(RepositoryMixin(RestApplication))) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;

    this.bind(`datasources.${AclAuthDBName}`).toAlias(`datasources.db`);
    this.bind(`datasources.${AclResourceDBName}`).toAlias(`datasources.db`);

    this.component(AuthorizationComponent);

    this.component(AccountComponent);
    this.component(GitClubComponent);
  }
}
