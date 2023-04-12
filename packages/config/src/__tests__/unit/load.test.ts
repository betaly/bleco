import {fixturePath} from '../support';
import {load} from '../../load';

describe('load config', function () {
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
    const config = await load('demo');
    expect(config).toMatchSnapshot();
    process.chdir(cwd);
  });

  it('should load from specific directory', async () => {
    const config = await load('demo', fixturePath('config-basic'));
    expect(config).toMatchSnapshot();
  });

  it('should return empty config loading from directory without config file and environments', async () => {
    const config = await load('demo', '.');
    expect(config).toEqual({});
  });

  it('should throw error loading from none existing directory', async () => {
    await expect(load('demo', '/none-exists')).rejects.toThrow(/no such file or directory/);
  });
});
