import {Configuration} from '@boost/config';
import popu from 'popu';
import {Config} from './config';
import {Env, EnvLoadOptions} from './env';
import {toArray} from 'tily/array/toArray';
import {AnyObj} from 'tily/typings/types';

export interface LoadOptions extends EnvLoadOptions {
  fromDirs?: string | string[];
}

/**
 * Load config from dirs in overwriting order.
 *
 * @param name - the app name of config.
 * @param options - Options to load config.
 */

export async function load<T extends object>(
  name: string | Configuration<T>,
  options?: string | string[] | LoadOptions,
) {
  const opts = typeof options === 'string' || Array.isArray(options) ? {fromDirs: options} : options ?? {};
  opts.mergeToProcessEnv = opts.mergeToProcessEnv ?? false;
  const c = name instanceof Configuration ? name : new Config<T>(name);
  const dirs = toArray(opts.fromDirs ?? process.cwd());
  const {env} = Env.load(dirs, opts);
  const config = await loadConfigs(c, dirs);
  return popu(config, env);
}

async function loadConfigs<T extends object>(c: Configuration<T>, fromDirs: string[]) {
  const answer: AnyObj = {};
  for (const dir of fromDirs) {
    const {config} = await c.loadConfigFromRoot(dir);
    Object.assign(answer, config);
  }
  return answer;
}
