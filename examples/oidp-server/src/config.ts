import {ConfigLoader} from '@bleco/config';
import {PortablePath} from '@jil/ncommon';
import {ApplicationConfig} from '@loopback/core';

// file name format: https://boostlib.dev/docs/config/#loading-config-files
const configLoader = new ConfigLoader('oidp');

export async function loadConfig(fromDir?: PortablePath): Promise<ApplicationConfig> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const defaults = require('../app.defaults.js');
  const config = await configLoader.load(fromDir);
  return {...defaults, ...config};
}
