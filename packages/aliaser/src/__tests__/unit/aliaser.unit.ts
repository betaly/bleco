import {BindingKey, Context} from '@loopback/context';
import {Application, CoreBindings} from '@loopback/core';
import {Aliaser} from '../../aliaser';

describe('Aliaser', () => {
  const options = {
    foo: {
      subFoo: 'this is subFoo',
    },
    bar: 'this is bar',
    other: 'this is other',
  };

  describe('Single Alias', function () {
    it('should alias with context', function () {
      const context = new Context();
      const OPTIONS = BindingKey.create('options');
      context.bind(OPTIONS).to(options);

      const aliaser = Aliaser.alias(OPTIONS, {
        foo: 'test.foo',
        bar: 'test.bar',
      });

      aliaser.apply(context);

      expect(context.getSync('test.foo')).toEqual(options.foo);
      expect(context.getSync('test.bar')).toEqual(options.bar);
    });

    it('should alias with string binding address', function () {
      const app = new Application(options);
      const aliaser = Aliaser.alias(CoreBindings.APPLICATION_CONFIG, {
        foo: 'test.foo',
        bar: 'test.bar',
      });

      aliaser.apply(app);

      expect(app.getSync('test.foo')).toEqual(options.foo);
      expect(app.getSync('test.bar')).toEqual(options.bar);
    });

    it('should alias with binding key', function () {
      const app = new Application(options);

      const FOO = BindingKey.create('test.foo');
      const BAR = BindingKey.create('test.bar');
      const aliaser = Aliaser.alias(CoreBindings.APPLICATION_CONFIG, {
        foo: FOO,
        bar: BAR,
      });

      aliaser.apply(app);

      expect(app.getSync(FOO)).toEqual(options.foo);
      expect(app.getSync(BAR)).toEqual(options.bar);
    });

    it('should alias with deep alias metadata', function () {
      const app = new Application(options);

      const SUB_FOO = BindingKey.create('test.subFoo');
      const BAR = BindingKey.create('test.bar');
      const aliaser = Aliaser.alias(CoreBindings.APPLICATION_CONFIG, {
        foo: {
          subFoo: SUB_FOO,
        },
        bar: BAR,
      });

      aliaser.apply(app);

      expect(app.getSync(SUB_FOO)).toEqual(options.foo.subFoo);
      expect(app.getSync(BAR)).toEqual(options.bar);
    });

    it('should alias with default CoreBindings.APPLICATION_CONFIG binding key', function () {
      const app = new Application(options);
      const aliaser = Aliaser.alias({
        foo: 'test.foo',
        bar: 'test.bar',
      });

      aliaser.apply(app);

      expect(app.getSync('test.foo')).toEqual(options.foo);
      expect(app.getSync('test.bar')).toEqual(options.bar);
    });

    it('should not override existing bindings default', function () {
      const app = new Application(options);

      const FOO = BindingKey.create('test.foo');
      const BAR = BindingKey.create('test.bar');

      app.bind(FOO).to('foo!!!');

      const aliaser = Aliaser.alias(CoreBindings.APPLICATION_CONFIG, {
        foo: FOO,
        bar: BAR,
      });

      aliaser.apply(app);

      expect(app.getSync(FOO)).toEqual('foo!!!');
      expect(app.getSync(BAR)).toEqual(options.bar);
    });

    it('should override existing bindings with override=ture options', function () {
      const app = new Application(options);

      const FOO = BindingKey.create('test.foo');
      const BAR = BindingKey.create('test.bar');

      app.bind(FOO).to('foo!!!');

      const aliaser = Aliaser.alias(CoreBindings.APPLICATION_CONFIG, {
        foo: FOO,
        bar: BAR,
      });

      aliaser.apply(app, {override: true});

      expect(app.getSync(FOO)).toEqual(options.foo);
      expect(app.getSync(BAR)).toEqual(options.bar);
    });
  });

  describe('Multiple Alias', function () {
    it('should alias success with in order', function () {
      const app = new Application(options);

      const FOO = BindingKey.create('test.foo');
      const SUB_FOO = BindingKey.create('test.foo.subFoo');

      Aliaser.alias({foo: FOO}).apply(app);
      Aliaser.alias(FOO, {subFoo: SUB_FOO}).apply(app);

      expect(app.getSync(FOO)).toEqual(options.foo);
      expect(app.getSync(SUB_FOO)).toEqual(options.foo.subFoo);
    });

    it('should alias success with in disorder', function () {
      const app = new Application(options);

      const FOO = BindingKey.create('test.foo');
      const SUB_FOO = BindingKey.create('test.foo.subFoo');

      Aliaser.alias(FOO, {subFoo: SUB_FOO}).apply(app);
      Aliaser.alias({foo: FOO}).apply(app);

      expect(app.getSync(FOO)).toEqual(options.foo);
      expect(app.getSync(SUB_FOO)).toEqual(options.foo.subFoo);
    });
  });

  describe('Alias multiple times', function () {
    it('should alias multiple times before applying', function () {
      const app = new Application(options);

      const FOO = BindingKey.create('test.foo');
      const SUB_FOO = BindingKey.create('test.foo.subFoo');

      Aliaser.alias(FOO, {subFoo: SUB_FOO}).alias({foo: FOO}).apply(app).apply(app);

      expect(app.getSync(FOO)).toEqual(options.foo);
      expect(app.getSync(SUB_FOO)).toEqual(options.foo.subFoo);
    });
  });
});
