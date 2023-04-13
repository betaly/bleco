import {load} from '@bleco/config';
import {ApplicationConfig} from '@loopback/core';

export async function loadConfig(defaults?: Partial<ApplicationConfig>) {
  return load('oidp', [__dirname, process.cwd()], {
    mergeToProcessEnv: true,
    defaults,
  });
}
