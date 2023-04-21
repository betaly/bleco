import {Configuration} from '@boost/config';
import merge from 'deepmerge';
import {traverse} from 'object-traversal';
import popu, {RenderOptions} from 'popu';
import {toArray} from 'tily/array/toArray';
import {AnyObj} from 'tily/typings/types';

import {Config} from './config';
import {Env, EnvLoadOptions} from './env';

const debug = require('debug')('bleco:config:load');

export interface LoadOptions<T extends object> extends EnvLoadOptions, RenderOptions {
  /**
   * The directories to load configs from.
   */
  fromDirs?: string | string[];

  /**
   * The default configs to merge with.
   */
  defaults?: Partial<T>;

  /**
   * Whether to keep blank values.
   *
   * @default false
   */
  keepBlanks?: boolean;

  /**
   * Whether to keep null values.
   *
   * @default false
   */
  keepNulls?: boolean;
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
  const config = await loadConfigs<T>(c, dirs, opts);
  return popu(config, env ?? {}, options);
}

async function loadConfigs<T extends object>(c: Configuration<T>, fromDirs: string[], options: LoadOptions<T> = {}) {
  const answer: AnyObj = {};
  for (const dir of fromDirs) {
    debug('load config from %s', dir);
    const {config} = await c.loadConfigFromRoot(dir);
    Object.assign(answer, config);
  }
  const result = merge(options.defaults ?? {}, answer);
  if (!options.keepBlanks || !options.keepNulls) {
    traverse(result, ({parent, key, value, meta}) => {
      if (parent && key) {
        if (!options.keepBlanks && value === '') {
          delete parent[key];
        } else if (!options.keepNulls && value === null) {
          delete parent[key];
        }
      }
    });
  }
  return result;
}
