import {juggler} from '@loopback/repository';
import {inject} from '@loopback/core';

const config = {
  name: 'redis',
  connector: 'redis',
};

export class RedisDataSource extends juggler.DataSource {
  static dataSourceName = 'redis';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.redis', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
