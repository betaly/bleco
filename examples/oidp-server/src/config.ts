import {load} from '@bleco/config';
import {ApplicationConfig} from '@loopback/core';

export async function loadConfig(fromDir?: string): Promise<ApplicationConfig> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const defaults = require('../app.defaults.js');
  const config = await load('oidp', fromDir);
  return {...defaults, ...config};
}
