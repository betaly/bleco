/* eslint-disable @typescript-eslint/no-explicit-any */
import {Filter, Where} from '@loopback/filter';
import {AnyObject} from '@loopback/repository';

export type QueryWhere<MT extends object = AnyObject> = Where<MT & Record<string, any>>;

export interface QueryFilter<MT extends object = AnyObject> extends Filter<MT> {
  where?: QueryWhere<MT>;
}
