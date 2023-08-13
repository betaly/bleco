import {juggler} from '@loopback/repository';
import {inject} from '@loopback/core';

const config = {
  name: 'kv-redis',
  connector: 'kv-redis',
};

export class KvRedisDataSource extends juggler.DataSource {
  static dataSourceName = 'kv-redis';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.kv-redis', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
