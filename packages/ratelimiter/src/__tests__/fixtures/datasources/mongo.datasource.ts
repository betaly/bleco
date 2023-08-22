import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'mongo',
  connector: 'mongodb',
};

export class MongoDataSource extends juggler.DataSource {
  static dataSourceName = 'mongo';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
