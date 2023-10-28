import {Parser} from './types';

export function isParser(target: unknown): target is Parser {
  return typeof target === 'function' || (typeof target === 'object' && target !== null && 'parse' in target);
}

export function parseValue<T>(parser: Parser, value?: unknown): T {
  if (!isParser(parser)) {
    throw new Error(`Invalid parser: ${parser}`);
  }

  if (typeof parser === 'function') {
    return parser(value);
  }

  return parser.parse(value);
}

export function composeParsers(...parsers: Parser[]): Parser {
  return value => parsers.reduce((acc, parser) => parseValue(parser, acc), value);
}
