import {inject} from '@loopback/context';
import {BindingScope, LifeCycleObserver, lifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import temp from 'temp';

const config = {
  name: 'db',
  connector: 'sqlite3e',
  file: temp.path({suffix: '.db'}),
};

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
