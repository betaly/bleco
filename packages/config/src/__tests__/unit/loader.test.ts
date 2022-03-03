import {ConfigLoader} from '../../loader';
import {fixturePath} from '../support';

describe('ConfigLoader', function () {
  const oldEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = {...oldEnv}; // Make a copy
  });

  afterAll(() => {
    process.env = oldEnv; // Restore old environment
  });

  it('should load from current working directory', async () => {
    const cwd = process.cwd();
    process.chdir(fixturePath('config-basic'));
    const loader = new ConfigLoader('test');
    const config = await loader.load();
    expect(config).toEqual({name: 'hello', foo: 'bar', deep: {object: {property: 'value'}}});
    process.chdir(cwd);
  });

  it('should load from specific directory', async () => {
    const loader = new ConfigLoader('test');
    const config = await loader.load(fixturePath('config-basic'));
    expect(config).toEqual({name: 'hello', foo: 'bar', deep: {object: {property: 'value'}}});
  });

  it('should merge from process.env', async () => {
    process.env.TEST_DEEP__OBJECT__INT_ZERO = '0';
    const loader = new ConfigLoader('test');
    const config = await loader.load(fixturePath('config-basic'));
    expect(config).toEqual({name: 'hello', foo: 'bar', deep: {object: {property: 'value', intZero: 0}}});
  });

  it('should return empty config loading from directory without config file and environments', async () => {
    const loader = new ConfigLoader('test');
    const config = await loader.load('.');
    expect(config).toEqual({});
  });

  it('should throw error loading from none existing directory', async () => {
    const loader = new ConfigLoader('test');
    await expect(loader.load('/none-exists')).rejects.toThrow(/no such file or directory/);
  });
});
