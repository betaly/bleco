import {Repository} from '../fixtures/repository';
import {mixin} from '../../mixin.decorator';
import {Foo, FooMixin} from '../fixtures/foo.mixin';
import {Bar, BarMixin} from '../fixtures/bar.mixin';

describe('@mixin', function () {
  it('should mixin a class', function () {
    @mixin(FooMixin)
    class MyRepository<T extends object, ID> extends Repository<T, ID> {}

    interface MyRepository<T extends object, ID> extends Foo<T, ID> {}

    const repo = new MyRepository<object, number>();
    expect(repo.message).toBe('foo');
    expect(repo.foo()).toBe('foo');
  });

  it('should mixin a class with multiple mixins', function () {
    @mixin(BarMixin)
    @mixin(FooMixin)
    class MyRepository<T extends object, ID> extends Repository<T, ID> {}

    interface MyRepository<T extends object, ID> extends Foo<T, ID>, Bar<T, ID> {}

    const repo = new MyRepository<object, number>();
    expect(repo.message).toBe('bar');
    expect(repo.foo()).toBe('foo');
    expect(repo.bar()).toBe('bar');
  });
});
