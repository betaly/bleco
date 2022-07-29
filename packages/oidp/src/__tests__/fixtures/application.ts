import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ApplicationConfig} from '@loopback/core';
import {MySequence} from './sequence';
import {OidcDataSourceName} from '../../types';
import {OidpComponent} from '../../oidp.component';
import {RestExplorerBindings} from '@loopback/rest-explorer';
import {BootMixin} from '@bleco/boot';

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
