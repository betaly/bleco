/* eslint-disable @typescript-eslint/no-explicit-any */

import {Entity} from "@loopback/repository";

export type WhereValue = any;

export type IdSort = boolean | 'numericIdOnly';

export type EntityClass<T extends Entity> = typeof Entity & {prototype: T};
