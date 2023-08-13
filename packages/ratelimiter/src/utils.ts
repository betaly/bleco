import {DataSource} from '@loopback/repository';

export function isDataSource(ds: unknown): ds is DataSource {
  return !!ds && typeof ds === 'object' && typeof (ds as DataSource).connect === 'function';
}
