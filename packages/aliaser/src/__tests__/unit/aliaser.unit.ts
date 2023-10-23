import {BindingKey, Context} from '@loopback/context';
import {Aliaser} from '../../aliaser';

describe('Aliaser', () => {
  let context: Context;
  let aliaser: Aliaser;

  beforeEach(() => {
    context = new Context();
    aliaser = new Aliaser();
  });

  test('create a new aliaser instance with static method', () => {
    const from = BindingKey.create('config');
    const definition = {prop: 'prop'};
    const instance = Aliaser.create(from, definition);
    expect(instance).toBeInstanceOf(Aliaser);
  });

  test('add an aliasing definition', () => {
    const from = BindingKey.create('config');
    const definition = {prop: 'prop'};
    aliaser.add(from, definition);
    expect(aliaser.definitions).toEqual([[from, definition]]);
  });

  test('add an aliasing definition without from key', () => {
    const definition = {prop: 'prop'};
    aliaser.add(definition);
    expect(aliaser.definitions).toEqual([[null, definition]]);
  });

  test('throw error for invalid definition format', () => {
    expect(() => {
      aliaser.add({prop: 123 as any});
    }).toThrow('Invalid value for property "prop".');

    expect(() => {
      aliaser.add({prop: ['config', 123 as any]});
    }).toThrow('Invalid validation format for property "prop".');

    const from = BindingKey.create('config');
    expect(() => {
      aliaser.add(from, {prop: 123 as any});
    }).toThrow('Invalid value for property "prop".');
  });

  test('bind aliasing definition', () => {
    context.bind('config').to({prop: 'value'});
    const from = BindingKey.create('config');
    aliaser.add(from, {prop: 'prop'});
    aliaser.bind(context);
    expect(context.getSync('prop')).toEqual('value');
  });

  test('override existing bindings', () => {
    context.bind('prop').to('existing');
    context.bind('config').to({prop: 'value'});
    const from = BindingKey.create('config');
    aliaser.add(from, {prop: 'prop'});
    aliaser.bind(context, {override: true});
    expect(context.getSync('prop')).toEqual('value');
  });

  test('bind as singleton', () => {
    context.bind('config').toDynamicValue(() => ({prop: Math.random()}));
    const from = BindingKey.create('config');
    aliaser.add(from, {prop: 'prop'});
    aliaser.bind(context);
    const value1 = context.getSync('prop');
    const value2 = context.getSync('prop');
    expect(value1).toEqual(value2);
  });

  test('apply validation', async () => {
    context.bind('config').to({prop: '5'});
    const from = BindingKey.create('config');
    const validate = (value: string) => parseInt(value);
    aliaser.add(from, {prop: ['prop', {parse: validate}]});
    aliaser.bind(context);
    expect(await context.get('prop')).toEqual(5);
  });
});
