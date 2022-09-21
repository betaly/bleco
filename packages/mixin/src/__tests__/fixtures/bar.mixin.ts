import {Constructor, MixinTarget} from '../../types';
import {Repository} from './repository';

export interface Bar<T extends object, ID> {
  message: string;

  bar(): string;
}

export function BarMixin<T extends object, ID, R extends MixinTarget<Constructor<Repository<T, ID>>>>(superClass: R) {
  return class extends superClass implements Bar<T, ID> {
    message = 'bar';

    bar() {
      return 'bar';
    }
  };
}
