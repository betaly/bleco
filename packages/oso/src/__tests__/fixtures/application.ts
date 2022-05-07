import {BootMixin} from '@bleco/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {RepositoryMixin} from '@loopback/repository';
import {OsoComponent} from '../../oso.component';
import {CommonComponent} from './components/common';
import {GitClubComponent} from './components/gitclub';

export class GitClubApplication extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.projectRoot = __dirname;

    this.component(OsoComponent);

    this.component(CommonComponent);
    this.component(GitClubComponent);
  }
}
