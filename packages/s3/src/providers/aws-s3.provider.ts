import {inject, Provider} from '@loopback/core';
import {S3WithSigner} from '..';
import {AWSS3Bindings, AwsS3Config} from '../types';

export class AwsS3Provider implements Provider<S3WithSigner> {
  constructor(
    @inject(AWSS3Bindings.Config)
    private readonly config: AwsS3Config,
  ) {}
  value(): S3WithSigner {
    return new S3WithSigner({
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
      region: this.config.region,
    });
  }
}
