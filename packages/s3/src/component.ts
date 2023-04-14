import {Component, ProviderMap} from '@loopback/core';

import {AwsS3Provider} from './providers';
import {AWSS3Bindings} from './types';

export class AwsS3Component implements Component {
  constructor() {
    this.providers = {
      [AWSS3Bindings.AwsS3Provider.key]: AwsS3Provider,
    };
  }

  providers?: ProviderMap = {};
}
