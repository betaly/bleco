import dotenvFlow, {DotenvReadFileOptions} from '@codexsoft/dotenv-flow';
import {AnyObj} from 'tily/typings/types';
import {existsSync} from 'fs';

export interface EnvLoadOptions extends DotenvReadFileOptions {
  /**
   * Whether to merge the loaded env to `process.env`.
   */
  mergeToProcessEnv?: boolean;
}

export class Env {
  static getEnvironmentName(): string {
    return process.env.FOAL_ENV || process.env.NODE_ENV || 'development';
  }

  static load(fromDir?: string, options: EnvLoadOptions = {}) {
    fromDir = fromDir || process.cwd();
    const files = dotenvFlow.listDotenvFiles(fromDir, {node_env: this.getEnvironmentName()});
    return this.loadFromFiles(files.filter(existsSync), options);
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
    const populate = options.mergeToProcessEnv ?? true;
    try {
      const parsed = dotenvFlow.parse(filenames, {
        encoding: options.encoding,
      });

      const env: AnyObj = {};
      for (const key of Object.keys(parsed)) {
        env[key] = process.env[key] ?? parsed[key];
        if (populate) {
          if (!Object.hasOwn(process.env, key)) {
            process.env[key] = parsed[key];
          } else if (!options.silent) {
            console.warn('env: "%s" is already defined in `process.env` and will not be overwritten', key); // >>>
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
