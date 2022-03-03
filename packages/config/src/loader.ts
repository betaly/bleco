import {PortablePath} from '@jil/ncommon';
import {isString} from 'tily/is/string';
import {mergeDeep} from 'tily/object/mergeDeep';
import {readEnv} from 'read-env';
import {ApplicationConfig} from '@loopback/core';
import {ApplicationConfiguration} from './configuration';
import toUpper from 'tily/string/toUpper';

export class ConfigLoader<T extends ApplicationConfig = ApplicationConfig> {
  configuration: ApplicationConfiguration;

  constructor(configuration: ApplicationConfiguration | string) {
    if (isString(configuration)) {
      this.configuration = new ApplicationConfiguration(configuration);
    } else {
      this.configuration = configuration;
    }
  }

  get name() {
    return this.configuration.name;
  }

  async load(fromDir?: PortablePath): Promise<T> {
    const {config} = await this.configuration.loadConfigFromRoot(fromDir);
    const env = readEnv(toUpper(this.name));
    return mergeDeep(config, env);
  }
}
