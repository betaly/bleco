import dotenvFlow, {DotenvReadFileOptions} from '@codexsoft/dotenv-flow';
import {existsSync} from 'fs';
import flatten from 'tily/array/flatten';
import {toArray} from 'tily/array/toArray';
import {AnyObj} from 'tily/typings/types';

const debug = require('debug')('bleco:config:env');

const parseVariables = require('dotenv-parse-variables');

export interface EnvLoadOptions extends DotenvReadFileOptions {
  /**
   * Whether to merge the loaded env to `process.env`.
   */
  mergeToProcessEnv?: boolean;
}

export class Env {
  static getEnvironmentName(): string {
    return process.env.NODE_ENV || 'development';
  }

  /**
   * Load variables defined in `fromDirs/.env*` files in overwriting order.
   *
   * @param fromDirs
   * @param options
   */
  static load(fromDirs?: string | string[], options: EnvLoadOptions = {}) {
    fromDirs = toArray(fromDirs || process.cwd());
    const files = flatten<string>(
      fromDirs.map(dir => dotenvFlow.listDotenvFiles(dir, {node_env: this.getEnvironmentName()})),
    ).filter(existsSync);

    return this.loadFromFiles(files, options);
  }

  /**
   * Load variables defined in a given file(s) into `process.env`.
   *
   * When several filenames are given, parsed environment variables are merged using the "overwrite" strategy since it utilizes `.parse()` for doing this.
   * But eventually, assigning the resulting environment variables to `process.env` is done using the "append" strategy,
   * thus giving a higher priority to the environment variables predefined by the shell.
   *
   * @param {string|string[]} filenames - filename or a list of filenames to load
   * @param {object} [options] - file loading options
   * @param {string} [options.encoding="utf8"] - encoding of `.env*` files
   * @param {boolean} [options.silent=false] - suppress all the console outputs except errors and deprecations
   * @param {boolean} [options.mergeToProcessEnv=true] - whether to merge the loaded env to `process.env`
   */
  private static loadFromFiles(filenames: string[], options: EnvLoadOptions = {}) {
    debug('load env from %s', filenames.join(', '));
    const mergeToProcessEnv = options.mergeToProcessEnv ?? true;
    try {
      const parsed = parseVariables(
        dotenvFlow.parse(filenames, {
          encoding: options.encoding,
        }),
        {assignToProcessEnv: false},
      );

      const env: AnyObj = {...process.env};
      for (const key of Object.keys(parsed)) {
        env[key] = env[key] ?? parsed[key];
        if (mergeToProcessEnv) {
          if (!Object.hasOwn(process.env, key)) {
            process.env[key] = parsed[key];
          } else if (!options.silent && process.env[key] !== parsed[key]) {
            console.warn(
              'env: ignoring set process.env.%s(%s)=%s from %s',
              key,
              process.env[key],
              parsed[key],
              filenames.join(', '),
            ); // >>>
          }
        }
      }

      return {parsed, env};
    } catch (error) {
      console.warn('env: error loading environment variables from %s', filenames.join(', ')); // >>>
      return {error};
    }
  }
}
