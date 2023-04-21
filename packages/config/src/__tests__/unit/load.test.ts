import {load} from '../../load';
import {fixturePath} from '../support';

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

  it('should not merge env variable to process.env with mergeToProcessEnv disabled', async () => {
    const config = await load('demo', fixturePath('config-basic'));
    expect(process.env.FOO_BAR_A).toBeUndefined();
  });

  it('should merge env variable to process.env with mergeToProcessEnv enabled', async () => {
    const config = await load('demo', fixturePath('config-basic'), {
      mergeToProcessEnv: true,
    });
    expect(process.env.FOO_BAR_A).toEqual('foo_bar_3');
  });

  it('should load with defaults config', async () => {
    const config = await load('demo', fixturePath('config-basic'), {
      defaults: {
        foo: 'bar',
        // The value ends with '*' will be treated as original value
        password: '123456*',
      },
    });
    expect(config).toMatchSnapshot();
  });

  it('should remove null and blank values default', async () => {
    const config = await load('demo', fixturePath('config-basic'), {
      defaults: {
        blank: '',
        null: null,
        awesome: 'yes',
      },
    });
    expect(config).toMatchSnapshot();
  });

  it('should load from multiple directories with overriding orders', async () => {
    const config = await load('demo', [fixturePath('config-default'), fixturePath('config-override')]);
    expect(config).toMatchSnapshot();
  });

  it('should throw error loading from none existing directory', async () => {
    await expect(load('demo', '/none-exists')).rejects.toThrow(/no such file or directory/);
  });
});
