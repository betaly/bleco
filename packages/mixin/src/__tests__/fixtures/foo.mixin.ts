import {Constructor, MixinTarget} from '../../types';
import {Repository} from './repository';

export interface Foo<T extends object, ID> {
  message: string;

  foo(): string;
}

export function FooMixin<T extends object, ID, R extends MixinTarget<Constructor<Repository<T, ID>>>>(superClass: R) {
  return class extends superClass implements Foo<T, ID> {
    message = 'foo';

    foo() {
      return 'foo';
    }
  };
}
