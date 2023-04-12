import {Configuration} from '@boost/config';
import popu from 'popu';
import {Config} from './config';
import {Env} from './env';

export async function load<T extends object>(name: string | Configuration<T>, fromDir?: string) {
  const c = name instanceof Configuration ? name : new Config(name);
  const {config} = await c.loadConfigFromRoot(fromDir);
  const {env} = Env.load(fromDir, {mergeToProcessEnv: false});
  return popu(config, env);
}
