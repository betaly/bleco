import {BootMixin} from '@bleco/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings} from '@loopback/rest-explorer';
import {OidpComponent} from '../../oidp.component';
import {OidcDataSourceName} from '../../types';
import {MySequence} from './sequence';

export class TestOidcApplication extends BootMixin(RepositoryMixin(RestApplication)) {
  constructor(options?: ApplicationConfig) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });

    this.projectRoot = __dirname;

    // bind datasource for oidp
    this.bind(`datasources.${OidcDataSourceName}`).toAlias(`datasources.db`);
    this.component(OidpComponent);
  }

  async main() {
    await this.boot();
    await this.start();
  }
}
