import {juggler} from '@loopback/repository';
import {inject} from '@loopback/core';

const config = {
  name: 'memory',
  connector: 'memory',
};

export class MemoryDataSource extends juggler.DataSource {
  static dataSourceName = 'memory';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.memory', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
