import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'kv-memory',
  connector: 'kv-memory',
};

export class KvMemoryDataSource extends juggler.DataSource {
  static dataSourceName = 'kv-memory';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.kv-memory', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
