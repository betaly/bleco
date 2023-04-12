import {Configuration} from '@boost/config';
import popu from 'popu';
import {Config} from './config';
import {Env} from './env';
import {toArray} from 'tily/array/toArray';
import {AnyObj} from 'tily/typings/types';

/**
 * Load config from dirs in overwriting order.
 *
 * @param name
 * @param fromDirs
 */

export async function load<T extends object>(name: string | Configuration<T>, fromDirs?: string | string[]) {
  const c = name instanceof Configuration ? name : new Config<T>(name);
  const dirs = toArray(fromDirs ?? process.cwd());
  const {env} = Env.load(dirs, {mergeToProcessEnv: false});
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
