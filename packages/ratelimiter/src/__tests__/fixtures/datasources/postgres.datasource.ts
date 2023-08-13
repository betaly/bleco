import {juggler} from '@loopback/repository';
import {inject} from '@loopback/core';

const config = {
  name: 'postgres',
  connector: 'postgresql',
};

export class PostgresDataSource extends juggler.DataSource {
  static dataSourceName = 'postgres';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.postgres', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
