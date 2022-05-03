import {Operators} from '@loopback/filter';

export type FieldOperators = Operators | '!' | '=' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not';

export const GroupOperators = ['and', 'or', 'not', '!', 'related'];

export const Directives = ['$expr'] as const;
export type Directive = typeof Directives[number];
