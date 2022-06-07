/* eslint-disable @typescript-eslint/no-explicit-any */

import {authorize as lbAuthorize} from '@loopback/authorization';
import {Entity} from '@loopback/repository';
import {toArray} from 'tily/array/toArray';
import {createResourceResolver} from '../authorization';

export namespace acls {
  /**
   * Decorator `@authorize` to mark methods that require authorization
   *
   * @param actions The actions to be authorized
   * @param resource The resource instance to be authorized
   */
  export function authorize(actions: string | string[], resource: Entity): any;
  /**
   * Decorator `@authorize` to mark methods that require authorization
   *
   * @param actions The actions to be authorized
   * @param resource The resource class to be authorized
   * @param idArgsIndex The index of the arguments that contains the resource id
   */
  export function authorize(actions: string | string[], resource: typeof Entity, idArgsIndex?: number): any;
  export function authorize(actions: string | string[], resource: typeof Entity | Entity, idArgsIndex = 0) {
    return lbAuthorize({
      scopes: toArray(actions),
      voters: [createResourceResolver(resource, idArgsIndex)],
    });
  }
}
