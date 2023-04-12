import {Blueprint, ModuleResolver, Schemas} from '@boost/common';
import {Configuration} from '@boost/config';

export class Config<T extends object> extends Configuration<T> {
  constructor(name: string, resolver?: ModuleResolver) {
    super(name, resolver);
    this.configureProcessor({validate: false});
  }
  blueprint({object}: Schemas): Blueprint<T> {
    return {} as Blueprint<T>;
  }
}
