import {ValueOf} from 'ts-essentials';
import {Operators} from '@loopback/filter';

export type FieldOperators = Operators | '!' | '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not';

export const GroupOperators = ['and', 'or', 'not', '!', 'related'];

export const Directives = {
  EXPR: '$expr',
  REL: '$rel',
} as const;

export type Directive = ValueOf<typeof Directives>;
