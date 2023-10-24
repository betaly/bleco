import {z} from 'zod';
import {BindingKey} from '@loopback/context';
import {InferAliasDefinition} from '../../types';

describe('InferAliasingDefinition', () => {
  it('should infer the correct types for a simple AliasingDefinition', () => {
    const definition = {
      foo: BindingKey.create<string>('foo'),
      bar: BindingKey.create<number>('bar'),
      baz: BindingKey.create<boolean>('baz'),
      maz: 'maz',
    } as const;

    type Result = InferAliasDefinition<typeof definition>;

    const _: Result = {
      foo: 'foo',
      bar: 1,
      baz: true,
      maz: 1,
    };

    expect(_).toBeDefined();
  });

  it('should infer the correct types for a complex AliasingDefinition', () => {
    const definition = {
      foo: BindingKey.create<string>('foo'),
      bar: [BindingKey.create<number>('bar'), z.number()],
      baz: {
        qux: BindingKey.create<boolean>('qux'),
        quux: [BindingKey.create<number>('quux'), z.number()],
      },
    } as const;

    type Result = InferAliasDefinition<typeof definition>;

    const _: Result = {
      foo: 'foo',
      bar: 1,
      baz: {
        qux: true,
        quux: 2,
      },
    };

    expect(_).toBeDefined();
  });
});
