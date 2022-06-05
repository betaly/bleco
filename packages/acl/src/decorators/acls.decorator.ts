/* eslint-disable @typescript-eslint/no-explicit-any */

import {authorize as lbAuthorize} from '@loopback/authorization';
import {Entity} from '@loopback/repository';
import {toArray} from 'tily/array/toArray';
import {createResourceResolver} from '../authorization';

export namespace acls {
  export function authorize(permissions: string | string[], resource: Entity): any;
  export function authorize(permissions: string | string[], resource: typeof Entity, idArgsIndex?: number): any;
  export function authorize(permissions: string | string[], resource: typeof Entity | Entity, idArgsIndex: number = 0) {
    return lbAuthorize({
      scopes: toArray(permissions),
      voters: [createResourceResolver(resource, idArgsIndex)],
    });
  }
}
