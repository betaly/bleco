import {S3, ServiceInputTypes} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {Command} from '@aws-sdk/smithy-client';
import {MetadataBearer, RequestPresigningArguments} from '@aws-sdk/types';
import {BindingKey} from '@loopback/core';

export namespace AWSS3Bindings {
  export const AwsS3Provider = BindingKey.create<S3>('bleco.aws.s3');
  export const Config = BindingKey.create<AwsS3Config>('bleco.aws.s3.config');
}

export interface AwsS3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}

export class S3WithSigner extends S3 {
  getSignedUrl<InputType extends ServiceInputTypes, OutputType extends MetadataBearer = MetadataBearer>(
    command: Command<
      InputType,
      OutputType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any,
      ServiceInputTypes,
      MetadataBearer
    >,
    options?: RequestPresigningArguments,
  ): Promise<string> {
    // @ts-ignore
    return getSignedUrl(this, command, options);
  }
}
