import {BootMixin} from '@bleco/boot';
import {OidcDataSourceName, OidpBindings, OidpComponent} from '@bleco/oidp';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import util from 'util';
import {FindAccountProvider} from './providers';
import {MySequence} from './sequence';

export class OidpApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(config: ApplicationConfig = {}) {
    super(config);

    console.log('Application with config:', util.inspect(config, {colors: true}));
    console.log('----');

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;

    // bind datasource for oidp
    this.bind(`datasources.${OidcDataSourceName}`).toAlias(`datasources.db`);
    // bind findAccount
    this.bind(OidpBindings.FIND_ACCOUNT).toProvider(FindAccountProvider);
    this.component(OidpComponent);
  }

  async main() {
    await this.boot();
    await this.start();
  }
}
