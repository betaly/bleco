import {BootMixin} from '@bleco/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {RepositoryMixin} from '@loopback/repository';
import {OsoComponent} from '../../oso.component';
import {CommonComponent} from './components/common';
import {GitClubComponent} from './components/gitclub';
import {AclAuthDBName, AclMixin, AclResourceDBName} from '@bleco/acl';

export class GitClubApplication extends BootMixin(AclMixin(RepositoryMixin(RestApplication))) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;

    this.bind(`datasources.${AclAuthDBName}`).toAlias(`datasources.db`);
    this.bind(`datasources.${AclResourceDBName}`).toAlias(`datasources.db`);

    this.component(OsoComponent);

    this.component(CommonComponent);
    this.component(GitClubComponent);
  }
}
