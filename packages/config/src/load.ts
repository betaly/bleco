import {Configuration} from '@boost/config';
import popu from 'popu';
import {Config} from './config';
import {Env, EnvLoadOptions} from './env';
import {toArray} from 'tily/array/toArray';
import {AnyObj} from 'tily/typings/types';

export interface LoadOptions<T extends object> extends EnvLoadOptions {
  fromDirs?: string | string[];
  defaults?: T;
}

/**
 * Load config from dirs in overwriting order.
 *
 */

export async function load<T extends object>(
  name: string | Configuration<T>,
  fromDirs?: string | string[],
  options?: LoadOptions<T>,
): Promise<T>;
export async function load<T extends object>(name: string | Configuration<T>, options?: LoadOptions<T>): Promise<T>;

export async function load<T extends object>(
  name: string | Configuration<T>,
  fromDirs?: string | string[] | LoadOptions<T>,
  options?: LoadOptions<T>,
) {
  if (typeof fromDirs !== 'string' && !Array.isArray(fromDirs)) {
    options = fromDirs;
    fromDirs = undefined;
  }
  const opts = options ?? {};
  opts.fromDirs = opts.fromDirs ?? fromDirs;
  opts.mergeToProcessEnv = opts.mergeToProcessEnv ?? false;
  const c = name instanceof Configuration ? name : new Config<T>(name);
  const dirs = toArray(opts.fromDirs ?? process.cwd());
  const {env} = Env.load(dirs, opts);
  const config = await loadConfigs<T>(c, dirs, opts.defaults);
  return popu(config, env);
}

async function loadConfigs<T extends object>(c: Configuration<T>, fromDirs: string[], defaults?: T) {
  const answer: AnyObj = defaults ?? {};
  for (const dir of fromDirs) {
    const {config} = await c.loadConfigFromRoot(dir);
    Object.assign(answer, config);
  }
  return answer;
}
