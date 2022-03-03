import {Configuration} from '@jil/config';
import {ApplicationConfig} from '@loopback/core';
import {Blueprint, Schemas} from '@jil/common/optimal';
import {ApplicationConfigSchema} from './schemas';

export class ApplicationConfiguration<T extends ApplicationConfig = ApplicationConfig> extends Configuration<T> {
  get allowUnknown() {
    return true;
  }

  blueprint(schemas: Schemas, onConstruction: boolean | undefined): Blueprint<T> {
    return ApplicationConfigSchema as Blueprint<T>;
  }
}
