import {Application, CoreBindings, inject, Provider} from '@loopback/core';
import {DataSource, Getter} from '@loopback/repository';

import {RateLimitSecurityBindings} from '../keys';
import {RateLimitConfig, RateLimitMetadata, RateLimitStoreClientType, RateLimitStoreSource} from '../types';
import {isDataSource} from '../utils';
import {resolveStoreClientType} from '../stores';
import {BindingAddress} from '@loopback/context';

export class RatelimitStoreSourceProvider implements Provider<RateLimitStoreSource> {
  constructor(
    @inject.getter(RateLimitSecurityBindings.METADATA)
    protected readonly getMetadata: Getter<RateLimitMetadata>,
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected readonly application: Application,
    @inject(RateLimitSecurityBindings.CONFIG, {optional: true})
    protected readonly config?: RateLimitConfig,
  ) {}

  value(): Promise<RateLimitStoreSource> {
    return this.action();
  }

  async action(): Promise<RateLimitStoreSource> {
    const dsConfig = this.config?.ds;

    let type: RateLimitStoreClientType | undefined;
    let storeClient = null;
    if (dsConfig && dsConfig !== ':memory:') {
      if (typeof dsConfig === 'function' && !dsConfig.dataSourceName) {
        throw new Error(`Invalid datasource: ${dsConfig}`);
      }

      const ds: DataSource | undefined = await (async () => {
        if (isDataSource(dsConfig)) {
          return dsConfig;
        }
        return this.application.get(
          typeof dsConfig === 'function'
            ? `datasources.${dsConfig.dataSourceName}`
            : (dsConfig as BindingAddress<DataSource>),
        );
      })();
      if (!ds?.connector) {
        throw new Error(`DataSource not connected or invalid datasource: ${dsConfig}`);
      }
      type = resolveStoreClientType(ds.connector.name);
      if (type == null) {
        throw new Error(`Unsupported datasource: ${ds.connector.name}`);
      }
      if (type !== RateLimitStoreClientType.Memory) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connector = ds.connector as any;
        storeClient = ds.client ?? connector.client ?? connector._client;
        if (!storeClient) {
          throw new Error(`No client found for datasource: ${dsConfig}`);
        }
      }
    }
    type = type ?? RateLimitStoreClientType.Memory;
    return {
      type,
      storeClient,
    };
  }
}
