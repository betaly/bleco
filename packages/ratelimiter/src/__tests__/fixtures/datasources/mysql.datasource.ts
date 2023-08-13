import {juggler} from '@loopback/repository';
import {inject} from '@loopback/core';

const config = {
  name: 'mysql',
  connector: 'mysql',
  url: 'mysql://root:root@localhost:3306/test',
};

export class MySQLDataSource extends juggler.DataSource {
  static dataSourceName = 'mysql';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mysql', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
