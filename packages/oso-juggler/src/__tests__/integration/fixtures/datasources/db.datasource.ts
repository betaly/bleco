import {BindingScope, LifeCycleObserver, lifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {inject} from '@loopback/context';
import temp from 'temp';

const config = {
  name: 'db',
  connector: 'sqlite3e',
  file: temp.path({suffix: '.db'}),
  debug: true,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource', {scope: BindingScope.SINGLETON})
export class DbDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = 'db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
